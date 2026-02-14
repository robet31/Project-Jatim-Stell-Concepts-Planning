import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, email, password, position } = body

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Nama, email, dan password wajib diisi' },
        { status: 400 }
      )
    }

    const validPositions = ['MANAGER', 'ASISTEN_MANAGER', 'STAFF']
    const userPosition = validPositions.includes(position) ? position : 'STAFF'
    const userRole = position === 'MANAGER' ? 'MANAGER' : (position === 'ASISTEN_MANAGER' ? 'ASISTEN_MANAGER' : 'STAFF')

    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: userRole,
        position: userPosition,
        isActive: true
      }
    })

    return NextResponse.json({
      message: 'Registrasi berhasil',
      user: { id: user.id, name: user.name, email: user.email, position: user.position }
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    )
  }
}
