import { z } from 'zod'
import { Router } from './'
import type { Request, Response } from 'express'

interface ExpressCtx {
  req: Request
  res: Response
}

/**
 * initialize a router builder
 */
let router = new Router().context<ExpressCtx>()

export const myRouter = router.build({
  a: {
    b: {
      c: router.procedure.input(z.boolean()).GET((input) => input),
      d: router.procedure.input(z.number()).POST((input) => input + 420),
      e: router.procedure.input(z.string()).POST((input) => input),
      f: router.procedure.POST(() => 'nice'),
      g: router.procedure.POST(() => {})
    }
  }
})

async function start() {
  const cFetch = await myRouter.a.b.c._fetch(false).then(res => res.json())
  const dFetch = await myRouter.a.b.d._fetch(123).then(res => res.json())
  const eFetch = await myRouter.a.b.e._fetch('hi').then(res => res.json())
  const fFetch = await myRouter.a.b.f._fetch().then(res => res.json())
  const gFetch = await myRouter.a.b.g._fetch().then(res => res.json())

  const cResolved = myRouter.a.b.c._resolver(true)
  const dResolved = myRouter.a.b.d._resolver(69)
  const eResolved = myRouter.a.b.e._resolver('hello')
  const fResolved = myRouter.a.b.f._resolver()
  const gResolved = myRouter.a.b.g._resolver()

  const all = {
    c: {
      fetch: cFetch,
      resolve: cResolved,
    },
    d: {
      fetch: dFetch,
      resolve: dResolved,
    },
    e: {
      fetch: eFetch,
      resolve: eResolved,
    },
    f: {
      fetch: fFetch,
      resolve: fResolved,
    },
    g: {
      fetch: gFetch,
      resolve: gResolved
    }
  } as const
  console.log(all)
}

start()

export type myRouter = typeof myRouter

