import { ProposalFormValues, GammaGenerationResponse } from '@/types'
import { mockBackendFetch } from '@/api/gamma'

/**
 * Client-side service that communicates with our "Secure Backend"
 * All calls here are proxied to the internal /api/gamma routes.
 */

export async function triggerGammaGeneration(
  data: ProposalFormValues,
): Promise<{ id: string }> {
  try {
    // Call the simulated backend route
    const response = await mockBackendFetch('/api/gamma/generate', 'POST', data)
    return response
  } catch (error: any) {
    // Enhance error for UI display
    console.error('Service Error:', error)
    throw new Error(
      JSON.stringify({
        message: error.message || 'Falha na comunicação com o servidor',
        status: error.status || 500,
        details: error.body || 'Unknown error',
      }),
    )
  }
}

export async function checkGammaStatus(
  generationId: string,
): Promise<GammaGenerationResponse> {
  try {
    // Call the simulated backend status route
    const response = await mockBackendFetch(
      `/api/gamma/status/${generationId}`,
      'GET',
    )
    return response
  } catch (error: any) {
    console.error('Status Check Error:', error)
    throw new Error(
      JSON.stringify({
        message: 'Falha ao verificar status',
        status: error.status || 500,
      }),
    )
  }
}
