const cfModule = {
  async fetch(request: Request, env: Env) {
    const url = new URL(request.url)

    console.log(url.pathname)

    return new Response(
      `request method: ${request.method}, ${await env.TMGS.get('test')}, ${env.ENVIRONMENT}`
    )
  },
}

export default cfModule
