import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@vercel/edge-config'
import { init } from '@launchdarkly/vercel-server-sdk'

export const config = {
  matcher: '/',
}

const vercelSDK = createClient(process.env.EDGE_CONFIG)

const ldClient = init('61df0103fe7924142ec6391d', vercelSDK)

export async function middleware(req: NextRequest) {
  await ldClient.waitForInitialization()
  try {
    const ldContext = { 
      kind: 'org',
      key: 'my-org-key',
      someAttribute: 'my-attribute-value'
    }
    // const storeClosedValue = await ldClient.variation('link-test-flag', ldContext, true);
    let storeClosedValue
    try {
      console.log('getting allFlagsState')
      const allValues = await ldClient.allFlagsState(ldContext)
      console.log({allValues: allValues.toJSON()})
      storeClosedValue = await ldClient.variation('link-test-flag', ldContext, true);
    } catch (e) {
      console.log('failed to get value', e)
    }
      console.log({storeClosedValue})
    if (storeClosedValue) {
      req.nextUrl.pathname = `/_closed`
      return NextResponse.rewrite(req.nextUrl)
    }
  } catch (error) {
    console.error(error)
  }
}
