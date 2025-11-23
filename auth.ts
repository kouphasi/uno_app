import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      return true;
    },
    async redirect({ url, baseUrl }) {
      // After sign in, redirect to nickname setup if not set
      if (url.startsWith(baseUrl)) {
        return url;
      }
      return baseUrl + '/setup-nickname';
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub as string;
        // @ts-ignore
        session.user.nickname = token.nickname as string;
      }
      return session;
    },
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
      }

      // Update nickname when it's set
      if (trigger === "update" && session?.nickname) {
        token.nickname = session.nickname;
      }

      return token;
    },
  },
  pages: {
    signIn: '/',
  },
})
