import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://knsajxxoarmskzxeatyr.supabase.co'
const supabaseAnonKey = 'sb_publishable_I40WNHiyfcV8tHG0HLGHwA_ad0PAvmS'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function POST(request: Request) {
  try {
    const body = await request.json()

    const { data, error } = await supabase.from('tools').insert([
      {
        name: body.name,
        category: body.category,
        url: body.url,
        pricing: body.pricing,
        description: body.description
      }
    ])

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ success: true, data })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}