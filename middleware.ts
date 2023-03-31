import { NextRequest, NextResponse } from 'next/server'
import { createClient, parseConnectionString } from '@vercel/edge-config'
import { init } from 'sdk'

export const config = {
  matcher: '/',
}

const ldClient = init({edgeSDK: createClient(process.env.EDGE_CONFIG), sdkKey: 'test', originalConfig: {}})

export async function middleware(req: NextRequest) {
  // for demo purposes, warn when there is no EDGE_CONFIG
  if (
    !process.env.EDGE_CONFIG ||
    !parseConnectionString(process.env.EDGE_CONFIG)
  ) {
    req.nextUrl.pathname = '/missing-edge-config'
    return NextResponse.rewrite(req.nextUrl)
  }
  console.log('wait for ld init')

  await ldClient.waitForInitialization()
  console.log('LD INIT COMPLETE')

  try {
    const ldContext = { 
      kind: 'org',
      key: 'my-org-key',
      someAttribute: 'my-attribute-value'
    }
    // console.log('getting all values')
    // const all = await ldClient.allFlagsState(ldContext, {})
    // console.log({all, values: all.allValues()})
    console.log('getting variation from ldclient')
    const storeClosedValue = await ldClient.variation('storeClosed', ldContext, true);
    console.log({storeClosedValue})
    if (storeClosedValue) {
      console.log('redirecting to closed')
      req.nextUrl.pathname = `/_closed`
      return NextResponse.rewrite(req.nextUrl)
    }
  } catch (error) {
    console.error(error)
  }
}
