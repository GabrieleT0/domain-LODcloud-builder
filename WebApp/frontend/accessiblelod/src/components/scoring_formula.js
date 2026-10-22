function Fraction({ numerator, denominator }) {
  return <mfrac><mtext>{numerator}</mtext><mtext>{denominator}</mtext></mfrac>;
}

// Native MathML keeps formulas selectable and accessible without extra libraries.
function ScoringFormula({ formula }) {
  const readability = formula.kind === 'readability';
  const label = readability
    ? 'min(1, max(0, (55 − LIX(description)) / 30))'
    : formula.branches
      ? formula.branches.map(([value, condition]) => `${value}: ${condition}`).join('; ')
      : `(${formula.numerator}) divided by (${formula.denominator})${formula.guard ? ` if ${formula.denominator} > 0; 0 otherwise` : ''}`;
  return (
    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label={label}>
      {readability ? (
        <mrow>
          <mi mathvariant="normal">min</mi><mo>(</mo><mn>1</mn><mo>,</mo>
          <mi mathvariant="normal">max</mi><mo>(</mo><mn>0</mn><mo>,</mo>
          <mfrac>
            <mrow><mn>55</mn><mo>−</mo><mi mathvariant="normal">LIX</mi><mo>(</mo><mi mathvariant="normal">description</mi><mo>)</mo></mrow>
            <mn>30</mn>
          </mfrac>
          <mo>)</mo><mo>)</mo>
        </mrow>
      ) : formula.branches ? (
        <mrow>
          <mo stretchy="true" fence="true">{'{'}</mo>
          <mtable columnalign="left left" columnspacing="0.7em" rowspacing="0.25em">
            {formula.branches.map(([value, condition]) => (
              <mtr key={condition}><mtd><mn>{value}</mn></mtd><mtd><mtext>{condition}</mtext></mtd></mtr>
            ))}
          </mtable>
        </mrow>
      ) : formula.guard ? (
        <mrow>
          <mo stretchy="true" fence="true">{'{'}</mo>
          <mtable columnalign="left left" columnspacing="0.7em" rowspacing="0.25em">
            <mtr>
              <mtd><Fraction numerator={formula.numerator} denominator={formula.denominator} /></mtd>
              <mtd><mtext>{`if ${formula.denominator} > 0`}</mtext></mtd>
            </mtr>
            <mtr><mtd><mn>0</mn></mtd><mtd><mtext>otherwise</mtext></mtd></mtr>
          </mtable>
        </mrow>
      ) : (
        <Fraction numerator={formula.numerator} denominator={formula.denominator} />
      )}
    </math>
  );
}
export default ScoringFormula;
