export const INFORMATION_ONLY_DECISION = 'information_only';

export function decisionSignals(decision) {
  return {
    buyNowSelected: decision === 'purchase',
    informationOnlySelected: decision === INFORMATION_ONLY_DECISION
  };
}

export function shouldRecoverCheckoutPage({ persisted, step, hasReturnCaseId }) {
  return Boolean(persisted && step === 6 && !hasReturnCaseId);
}

export function shouldScrollAfterRender(interaction) {
  return interaction === 'step-change';
}

export function checkoutIdempotencyKey(caseId, selectedProduct) {
  return `${caseId}:checkout:${selectedProduct}:v1`;
}

export function shouldRepositionStep({ top, bottom, viewportHeight }) {
  const comfortableTop = 18;
  const comfortableBottom = Math.min(viewportHeight * 0.52, 520);
  return bottom < comfortableTop || top > comfortableBottom;
}
