import { auth } from "@/auth"
import { NextResponse } from "next/server"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isOnSetupNickname = req.nextUrl.pathname.startsWith('/setup-nickname')
  const isOnHome = req.nextUrl.pathname === '/'
  const isOnAuth = req.nextUrl.pathname.startsWith('/api/auth')

  // Allow access to auth endpoints
  if (isOnAuth) {
    return NextResponse.next()
  }

  // Allow access to home page
  if (isOnHome) {
    return NextResponse.next()
  }

  // Protect setup-nickname page - only logged in users
  if (isOnSetupNickname && !isLoggedIn) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|public).*)'],
}
