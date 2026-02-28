// Impact Score ranking — simplified hot algorithm
// impact = sign * log10(max(abs(net), 1)) - age_hours / decay
// decay = (age_hours + 2) ^ 1.5  where net = insights - challenges
export function computeImpactScore(insights: number, challenges: number, createdAt: string): number {
    const net = insights - challenges;
    const sign = net > 0 ? 1 : net < 0 ? -1 : 0;
    const order = Math.log10(Math.max(Math.abs(net), 1));
    const ageHours = (Date.now() - new Date(createdAt).getTime()) / 3_600_000;
    const decay = Math.pow(ageHours + 2, 1.5);
    return sign * order - ageHours / decay;
}
