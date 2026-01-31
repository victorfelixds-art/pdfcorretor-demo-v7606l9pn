import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import * as GammaBackend from '@/api/gamma'

// Re-exporting the prompt builder if needed by other components, although logic is now in API
export { buildGammaPrompt } from '@/api/gamma'

/**
 * Triggers the generation of the proposal.
 * In this secure implementation, it delegates to the backend module which handles
 * the API Key and CORS logic (or simulation).
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
