import React, { useEffect, useId, useRef, useState } from 'react';
import * as d3 from 'd3';
import Footer from './footer';
import { scoreColor } from './graphLayout';
import { useGraphLayout } from './useGraphLayout';
import './Graph.css';
import { fitNodeLabel } from './graphLabels';

const getDatasetUrl = node => {
    const url = new URL(window.location.href);
    url.hash = `/accessibility_info?dataset_id=${encodeURIComponent(node.id)}`;
    return url.href;
};

function Graph({ data, loading = false, error = null }) {
    const svgRef = useRef(null);
    const zoomRef = useRef(null);
    const [view, setView] = useState('connected');
    const [exportError, setExportError] = useState('');
    const [exporting, setExporting] = useState(false);
    const gradientId = `score-${useId().replace(/:/g, '')}`;
    const { layout, layoutLoading, layoutError } = useGraphLayout(data);
    const activeView = layout.connectedCount ? view : 'isolated';
    const fitView = nextView => {
        setView(nextView);
        if (zoomRef.current) d3.select(svgRef.current).call(zoomRef.current.transform, d3.zoomIdentity);
    };

    useEffect(() => {
        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();
        if (!layout.nodes.length) return;
        const bounds = layout.connectedBounds;
        svg.attr('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
        const layer = svg.append('g').attr('class', 'cloud-content');
        const zoom = d3.zoom().scaleExtent([0.5, 12]).on('zoom', event => layer.attr('transform', event.transform));
        svg.call(zoom).on('dblclick.zoom', null).call(zoom.transform, d3.zoomIdentity);
        zoomRef.current = zoom;
        if (layout.isolatedCount) {
            layer.append('line').attr('data-cloud-section', 'isolated')
                .attr('x1', 30).attr('x2', layout.width - 30)
                .attr('y1', layout.dividerY).attr('y2', layout.dividerY)
                .attr('stroke', '#94a3b8').attr('stroke-dasharray', '6 6');
            layer.append('text').attr('data-cloud-section', 'isolated')
                .attr('x', layout.width / 2).attr('y', layout.dividerY + 33)
                .attr('text-anchor', 'middle').attr('fill', '#475569').attr('font-size', 18)
                .text(`Isolated datasets (${layout.isolatedCount})`);
        }
        // One SVG path replaces thousands of individual link elements.
        const linkPath = link => `M${link.source.x},${link.source.y}L${link.target.x},${link.target.y}`;
        const linkLayer = layer.append('g').attr('data-cloud-section', 'connected').attr('fill', 'none');
        const links = linkLayer.append('path').attr('class', 'cloud-links')
            .attr('d', layout.links.map(linkPath).join(''))
            .attr('stroke', '#64748b').attr('stroke-width', 0.8).attr('stroke-opacity', 0.08);
        const highlightedLinks = linkLayer.append('path').attr('class', 'cloud-highlight')
            .attr('stroke', '#f97316').attr('stroke-width', 0.8).attr('stroke-opacity', 0.85)
            .attr('pointer-events', 'none');
        const groups = layer.append('g').selectAll('a').data(layout.nodes).join('a')
            .attr('data-cloud-section', node => node.isolated ? 'isolated' : 'connected')
            .attr('href', getDatasetUrl).attr('target', '_blank').attr('rel', 'noopener noreferrer')
            .attr('transform', node => `translate(${node.x},${node.y})`)
            .attr('aria-label', node => `${node.title || node.id}. Accessibility: ${node.score == null ? 'not available' : node.score.toFixed(3)}. Incoming links: ${node.incoming}. Open dataset.`);
        groups.append('title').text(node => `${node.title || node.id}\nDomain: ${node.category || 'No domain'}\nAccessibility: ${node.score == null ? 'No score available' : node.score.toFixed(3)}\nIncoming links: ${node.incoming}`);
        groups.append('circle').attr('r', node => node.radius).attr('fill', node => scoreColor(node.score))
            .attr('stroke', '#ffffff').attr('stroke-width', 1.5);
        const labelClips = svg.append('defs').selectAll('clipPath').data(layout.nodes).join('clipPath')
            .attr('id', (node, index) => `${gradientId}-label-${index}`);
        labelClips.append('circle').attr('r', node => node.radius - 3);
        const textContext = document.createElement('canvas').getContext('2d');
        groups.append('text').attr('text-anchor', 'middle').attr('dy', '0.35em')
            .attr('font-size', node => Math.min(13, Math.max(10, node.radius * 0.36)))
            .attr('font-family', 'Arial, sans-serif').attr('font-weight', 600)
            .attr('pointer-events', 'none').attr('clip-path', (node, index) => `url(#${gradientId}-label-${index})`)
            .attr('fill', node => d3.lab(scoreColor(node.score)).l < 55 ? '#ffffff' : '#14202b')
            .each(function(node) {
                const label = d3.select(this);
                const fontSize = Math.min(13, Math.max(10, node.radius * 0.36));
                const maxWidth = 2 * Math.sqrt((node.radius - 4) ** 2 - (fontSize * 0.65) ** 2);
                textContext.font = `600 ${fontSize}px Arial, sans-serif`;
                const measure = text => textContext.measureText(text).width;
                label.text(fitNodeLabel(node.title || node.id, maxWidth, measure));
            });
        const neighbors = new Map(layout.nodes.map(node => [node.id, new Set([node.id])]));
        const incidentLinks = new Map(layout.nodes.map(node => [node.id, []]));
        layout.links.forEach(link => {
            incidentLinks.get(link.source.id).push(link);
            if (link.target.id !== link.source.id) incidentLinks.get(link.target.id).push(link);
            neighbors.get(link.source.id).add(link.target.id);
            neighbors.get(link.target.id).add(link.source.id);
        });
        const highlight = (event, node) => {
            const adjacent = neighbors.get(node.id);
            groups.attr('opacity', other => adjacent.has(other.id) ? 1 : 0.15);
            groups.select('circle').attr('stroke', other => adjacent.has(other.id) ? '#f97316' : '#fff');
            links.attr('stroke-opacity', 0.025);
            highlightedLinks.attr('d', incidentLinks.get(node.id).map(linkPath).join(''));
        };
        const reset = () => {
            groups.attr('opacity', 1).select('circle').attr('stroke', '#ffffff');
            links.attr('stroke-opacity', 0.08);
            highlightedLinks.attr('d', null);
        };
        groups.on('mouseenter focus', highlight).on('mouseleave blur', reset);
        return () => { svg.on('.zoom', null); zoomRef.current = null; };
    }, [layout, gradientId]);

    // Switching sections only changes visibility and framing; keep all SVG nodes.
    useEffect(() => {
        if (!layout.nodes.length || !zoomRef.current) return;
        const svg = d3.select(svgRef.current);
        const bounds = activeView === 'isolated' ? layout.isolatedBounds : layout.connectedBounds;
        svg.attr('viewBox', `${bounds.x} ${bounds.y} ${bounds.width} ${bounds.height}`);
        svg.selectAll('[data-cloud-section]').attr('visibility', function() {
            return this.getAttribute('data-cloud-section') === activeView ? null : 'hidden';
        });
        svg.call(zoomRef.current.transform, d3.zoomIdentity);
    }, [layout, activeView]);

    // Downloads include the whole cloud, independent of zoom and hover state.
    const exportSvg = () => {
        const clone = svgRef.current.cloneNode(true);
        clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        clone.setAttribute('width', layout.width);
        clone.setAttribute('height', layout.height + 75);
        clone.setAttribute('viewBox', `0 -75 ${layout.width} ${layout.height + 75}`);
        clone.querySelector('.cloud-content')?.removeAttribute('transform');
        clone.querySelectorAll('[data-cloud-section]').forEach(section => section.removeAttribute('visibility'));
        clone.querySelector('.cloud-highlight')?.remove();
        clone.querySelector('.cloud-links')?.setAttribute('stroke-opacity', '0.08');
        clone.querySelectorAll('a').forEach(node => {
            node.setAttribute('opacity', 1);
            node.querySelector('circle').setAttribute('stroke', '#fff');
        });
        clone.querySelectorAll('.cloud-content line').forEach(line => {
            if (!line.hasAttribute('stroke-dasharray')) {
                line.setAttribute('stroke', '#64748b');
                line.setAttribute('stroke-opacity', '0.08');
            }
        });
        const ns = 'http://www.w3.org/2000/svg';
        const add = (tag, attrs, text) => {
            const element = document.createElementNS(ns, tag);
            Object.entries(attrs).forEach(([key, value]) => element.setAttribute(key, value));
            if (text) element.textContent = text;
            clone.appendChild(element);
            return element;
        };
        const background = add('rect', { x: 0, y: -75, width: layout.width, height: layout.height + 75, fill: '#fff' });
        clone.insertBefore(background, clone.firstChild);
        add('text', { x: 30, y: -45, 'font-size': 16, 'font-family': 'Arial, sans-serif' }, 'AccessibleLOD · Accessibility score (0–1) · Node size = incoming links');
        for (let i = 0; i < 100; i += 1) add('rect', { x: 30 + i * 3, y: -30, width: 3.1, height: 10, fill: scoreColor(i / 99) });
        add('text', { x: 30, y: -5, 'font-size': 12 }, '0 (low)                                      1 (high)       Gray: no score');
        return clone;
    };
    const download = (blob, extension) => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = `accessiblelod-cloud.${extension}`;
        anchor.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    };
    const handleExport = async format => {
        setExportError('');
        setExporting(true);
        try {
            const svg = exportSvg();
            const blob = new Blob([new XMLSerializer().serializeToString(svg)], { type: 'image/svg+xml;charset=utf-8' });
            if (format === 'svg') download(blob, 'svg');
            if (format === 'pdf') {
                const [{ jsPDF }] = await Promise.all([import('jspdf'), import('svg2pdf.js')]);
                const pdf = new jsPDF({ orientation: layout.width > layout.height + 75 ? 'landscape' : 'portrait', unit: 'pt', format: [layout.width, layout.height + 75] });
                await pdf.svg(svg, { x: 0, y: 0, width: layout.width, height: layout.height + 75 });
                pdf.save('accessiblelod-cloud.pdf');
            }
            if (format === 'png') {
                const url = URL.createObjectURL(blob);
                try {
                    const image = new Image();
                    image.src = url;
                    await image.decode();
                    const scale = Math.min(2, 8192 / Math.max(layout.width, layout.height + 75));
                    const canvas = document.createElement('canvas');
                    canvas.width = Math.ceil(layout.width * scale);
                    canvas.height = Math.ceil((layout.height + 75) * scale);
                    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);
                    const png = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
                    if (!png) throw new Error('PNG export failed');
                    download(png, 'png');
                } finally { URL.revokeObjectURL(url); }
            }
        } catch (err) { setExportError('Unable to export the cloud. Please try again.'); }
        finally { setExporting(false); }
    };
    return (
        <div className="lod-cloud">
            <div className="cloud-toolbar">
                <div className="cloud-legend">
                    <strong>Accessibility score</strong>
                    <svg width="180" height="30" role="img" aria-label="Accessibility score from 0, light teal, through AccessibleLOD teal, to 1, dark teal">
                        <defs><linearGradient id={gradientId}>{d3.range(0, 1.01, 0.1).map(value => <stop key={value} offset={`${value * 100}%`} stopColor={scoreColor(value)} />)}</linearGradient></defs>
                        <rect width="180" height="10" rx="5" fill={`url(#${gradientId})`} />
                        <text x="0" y="26" fontSize="11">0 · Low</text><text x="180" y="26" textAnchor="end" fontSize="11">1 · High</text>
                    </svg>
                    <span className="cloud-missing"><i /> No score</span>
                    <small>Normalized score (0–1)</small>
                </div>
                <div className="cloud-controls" aria-label="Graph controls">
                    <button aria-label="Zoom in" onClick={() => zoomRef.current && d3.select(svgRef.current).call(zoomRef.current.scaleBy, 1.5)}>+</button>
                    <button aria-label="Zoom out" onClick={() => zoomRef.current && d3.select(svgRef.current).call(zoomRef.current.scaleBy, 1 / 1.5)}>−</button>
                    <button disabled={!layout.connectedCount} aria-pressed={activeView === 'connected'} onClick={() => fitView('connected')}>Fit cloud</button>
                    <button
                        disabled={activeView === 'isolated' ? !layout.connectedCount : !layout.isolatedCount}
                        onClick={() => fitView(activeView === 'isolated' ? 'connected' : 'isolated')}
                    >
                        {activeView === 'isolated' ? 'Inspect connected component' : 'Inspect isolated nodes'}
                    </button>
                </div>
            </div>
            <div className="cloud-hint">{layout.nodes.length.toLocaleString()} datasets · {layout.links.length.toLocaleString()} links · Size: incoming links · Scroll to zoom, drag to pan, select a node to explore</div>
            <div className="cloud-viewport">
                {error || layoutError ? <p role="alert">{error || layoutError}</p> : loading || layoutLoading ? <p role="status">{loading ? 'Loading graph data…' : 'Preparing cloud…'}</p> : !layout.nodes.length ? <p>No datasets available.</p> : null}
                <svg ref={svgRef} id="graph" aria-label="AccessibleLOD dataset network" />
            </div>
            {exportError && <p role="alert">{exportError}</p>}
            <div className="cloud-downloads">
                {['svg', 'png', 'pdf'].map(format => <button key={format} disabled={!layout.nodes.length || exporting} onClick={() => handleExport(format)}>Download {format.toUpperCase()}</button>)}
            </div>
            <Footer />
        </div>
    );
}
export default Graph;
