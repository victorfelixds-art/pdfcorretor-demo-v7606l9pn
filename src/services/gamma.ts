import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import * as GammaBackend from '@/api/gamma'

export { buildGammaPrompt } from '@/api/gamma'

/**
 * Triggers the generation of the proposal.
 * Delegates to the secure backend integration (simulated).
 */
export async function triggerGammaGeneration(
  data: ProposalFormValues,
): Promise<{ id: string }> {
  return GammaBackend.createGeneration(data)
}

/**
 * Checks the status of the generation.
 * Proxies the check to the backend module.
 */
export async function checkGammaStatus(
  generationId: string,
): Promise<GammaGenerationResponse> {
  return GammaBackend.checkStatus(generationId)
}
