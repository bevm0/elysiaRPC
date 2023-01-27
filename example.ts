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
let router = new Router<undefined, ExpressCtx>()

export const myRouter = router.build({
  a: {
    b: {
      c: router.procedure.input(z.boolean()).GET(({ input }) => input),
      d: router.procedure.input(z.number()).POST(({ input }) => input),
      e: router.procedure.input(z.string()).POST(({ input }) => input),
      f: router.procedure.POST(() => 'ni'),
      g: router.procedure
    }
  }
})


const cFetch = myRouter.a.b.c.fetch().then(res => res.json())
const dFetch = myRouter.a.b.d.fetch().then(res => res.json())
const eFetch = myRouter.a.b.e.fetch().then(res => res.json())
const fFetch = myRouter.a.b.f.fetch().then(res => res.json())
const gFetch = myRouter.a.b.g.fetch().then(res => res.json())

const cResolved = async (req: Request, res: Response) => await myRouter.a.b.c.resolve({ ctx: { req, res }, input: true })
const dResolved = async (req: Request, res: Response) => await myRouter.a.b.d.resolve({ ctx: { req, res }, input: 123 })
const eResolved = async (req: Request, res: Response) => await myRouter.a.b.e.resolve({ ctx: { req, res }, input: 'hello' })
const fResolved = async (req: Request, res: Response) => await myRouter.a.b.f.resolve()
const gResolved = async (req: Request, res: Response) => await myRouter.a.b.g.resolve()

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

export type myRouter = typeof myRouter

export type Test = myRouter['a']['b']['g']['_def']['method']

