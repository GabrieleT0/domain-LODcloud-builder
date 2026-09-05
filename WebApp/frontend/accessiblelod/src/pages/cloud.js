import Graph from "../components/Graph";
import { base_url } from '../api';
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/navbar';

function Cloud(){
    const [data, setData] = useState({ nodes: [], links: [] });
    const navigate = useNavigate();

    useEffect(() => {
            fetch(`${base_url}/AccessibleLOD_data/all_ch_links`)
                .then(response => response.json())
                .then(data => setData(data));
    }, []);

    const handleInsertResource = () => {
        navigate('/add-dataset'); 
    }

    const handleSearch = () => {
        navigate('/search'); 
    }

    const handleDash = () => {
        navigate('/dashboard')
    }

    const handleAbout = () => {
        navigate('/about')
    }

return (
    <div className="container-fluid mt-3 px-4">
    <Navbar />
    <div className="d-flex flex-column justify-content-center align-items-center my-3">
        <h2 style={{ fontFamily: "'Verdana', serif", color: "#46B9B9" }}>
        <b>AccessibleLOD</b>
        </h2>
        <h3 style={{ fontFamily: "'Verdana', serif", color: "#46B9B9" }}>
        Linked Open Data for All
        </h3>
    </div>
    <Graph data={data} />
    </div>
)

}

export default Cloud;
