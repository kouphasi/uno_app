import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

// In-memory storage for user nicknames (replace with database in production)
const userNicknames = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { nickname } = body;

    if (!nickname || typeof nickname !== 'string') {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'ニックネームは必須です' } },
        { status: 400 }
      );
    }

    const trimmedNickname = nickname.trim();

    if (trimmedNickname.length < 2) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'ニックネームは2文字以上で入力してください' } },
        { status: 400 }
      );
    }

    if (trimmedNickname.length > 20) {
      return NextResponse.json(
        { error: { code: 'INVALID_REQUEST', message: 'ニックネームは20文字以内で入力してください' } },
        { status: 400 }
      );
    }

    // Store nickname for the user
    const userId = session.user.id || session.user.email;
    if (userId) {
      userNicknames.set(userId, trimmedNickname);
    }

    return NextResponse.json({
      nickname: trimmedNickname,
      success: true,
    });

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session || !session.user) {
      return NextResponse.json(
        { error: { code: 'UNAUTHORIZED', message: 'ログインが必要です' } },
        { status: 401 }
      );
    }

    const userId = session.user.id || session.user.email;
    const nickname = userId ? userNicknames.get(userId) : null;

    return NextResponse.json({
      nickname: nickname || null,
    });

  } catch (error) {
    return NextResponse.json(
      { error: { code: 'INTERNAL_ERROR', message: '内部エラーが発生しました' } },
      { status: 500 }
    );
  }
}
