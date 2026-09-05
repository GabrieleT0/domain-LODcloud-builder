function ScoreValue({ value }) {
  if (value === 'FR / 50 − 1') {
    return (
      <mrow>
        <mfrac><mi>FR</mi><mn>50</mn></mfrac>
        <mo>−</mo><mn>1</mn>
      </mrow>
    );
  }
  return <mn>{value}</mn>;
}

// Native MathML keeps fractions and piecewise rules selectable and accessible
// without loading a third-party script or converting formulas into images.
function ScoringFormula({ formula }) {
  const label = formula.branches
    ? formula.branches.map(([value, condition]) => `${value}: ${condition}`).join('; ')
    : `${formula.offset ? '−1 plus ' : ''}(${formula.numerator}) divided by (${formula.denominator})`;

  return (
    <math xmlns="http://www.w3.org/1998/Math/MathML" display="block" aria-label={label}>
      {formula.branches ? (
        <mrow>
          <mo stretchy="true" fence="true">{'{'}</mo>
          <mtable columnalign="left left" columnspacing="1em" rowspacing="0.4em">
            {formula.branches.map(([value, condition]) => (
              <mtr key={condition}>
                <mtd><ScoreValue value={value} /></mtd>
                <mtd><mtext>{condition}</mtext></mtd>
              </mtr>
            ))}
          </mtable>
        </mrow>
      ) : (
        <mrow>
          {formula.offset !== 0 && <><mn>−1</mn><mo>+</mo></>}
          <mfrac>
            <mtext>{formula.numerator}</mtext>
            <mtext>{formula.denominator}</mtext>
          </mfrac>
        </mrow>
      )}
    </math>
  );
}

export default ScoringFormula;
