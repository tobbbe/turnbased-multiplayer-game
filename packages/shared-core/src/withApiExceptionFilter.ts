// Use any here to avoid having to install nextjs to the package
/* eslint-disable @typescript-eslint/no-explicit-any */

export function withApiExceptionFilter(nextReqAndRes: { req: any; res: any }) {
  return async function (nextJsApihandler: any) {
    try {
      return await nextJsApihandler(nextReqAndRes.req, nextReqAndRes.res)
    } catch (error) {
      if (error instanceof ErrorForClient) {
        devErrorAlert(`-- 🤡 BAD CLIENT REQUEST 🤡 --`, error)

        // This exception should not be logged

        if (error.statusCode < 400) {
          throw new Error("Status code should not be 'ok' if throwing this exception")
        }

        const formattedErrorForClient = { message: error.message }
        return nextReqAndRes.res.status(error.statusCode).send(formattedErrorForClient)
      }

      if (process.env.NODE_ENV === 'production') {
        // console.error will log to stderr
        // see: https://vercel.com/docs/concepts/deployments/runtime-logs#level
        console.error(error)
      }
      devErrorAlert('-- 🚨 UNHANDLED SERVER ERROR 🚨 --', error)

      return nextReqAndRes.res.status(500).send({ message: 'Server error' })
    }
  }
}

export class ErrorForClient extends Error {
  statusCode: number

  constructor(message: string, options?: { statusCode?: number }) {
    super(message)
    Object.setPrototypeOf(this, ErrorForClient.prototype)

    this.statusCode = options?.statusCode || 400
  }
}

const devErrorAlert = (msg: string, error: unknown) => {
  if (process.env.NODE_ENV === 'production') return
  console.error('\n\n\x1b[91m' + msg + '\x1b[0m' + '\n')
  console.error(error, '\n\n')
}
