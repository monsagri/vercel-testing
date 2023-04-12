import { NextRequest, NextResponse } from 'next/server'
import { createClient, parseConnectionString } from '@vercel/edge-config'
import init from '@launchdarkly/vercel-server-sdk'

export const config = {
  matcher: '/',
}

const vercelSDK = createClient(process.env.EDGE_CONFIG)

const ldClient = init(vercelSDK, 'test', {})

export async function middleware(req: NextRequest) {
  await ldClient.waitForInitialization()
  try {
    const ldContext = { 
      kind: 'org',
      key: 'my-org-key',
      someAttribute: 'my-attribute-value'
    }
    const storeClosedValue = await ldClient.variation('storeClosed', ldContext, true);
    console.log({storeClosedValue})
    if (storeClosedValue) {
      req.nextUrl.pathname = `/_closed`
      return NextResponse.rewrite(req.nextUrl)
    }
  } catch (error) {
    console.error(error)
  }
}
