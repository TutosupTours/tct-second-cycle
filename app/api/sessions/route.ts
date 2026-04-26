import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { handleApiError, sanitizeInput } from '@/lib/errors';
import type { ECOSSession } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    console.log('API called - checking env vars');
    console.log('SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'DEFINED' : 'UNDEFINED');
    console.log('SUPABASE_ANON_KEY:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'DEFINED' : 'UNDEFINED');
    console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'DEFINED' : 'UNDEFINED');

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const promotion = searchParams.get('promotion');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    console.log('Query params:', { status, promotion, page, limit });

    let query = supabaseAdmin
      .from('ecos_sessions')
      .select('*', { count: 'exact' })
      .order('session_date', { ascending: false });

    console.log('Query created');

    if (status) {
      query = query.eq('status', status);
    }

    if (promotion) {
      query = query.eq('promotion', promotion);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    console.log('Executing query...');
    const { data, error, count } = await query;

    console.log('Query executed, error:', error);

    if (error) {
      throw handleApiError(error);
    }

    console.log('Returning data, count:', count);
    return NextResponse.json({
      data: data as ECOSSession[],
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Caught error:', error);
    const appError = handleApiError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.statusCode }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, promotion, session_date, location, capacity, description } = body;

    if (!title || !promotion || !session_date || !location || !capacity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate date
    const sessionDate = new Date(session_date);
    if (isNaN(sessionDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid session date' },
        { status: 400 }
      );
    }

    // Validate capacity
    if (capacity <= 0 || capacity > 1000) {
      return NextResponse.json(
        { error: 'Invalid capacity (must be between 1 and 1000)' },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from('ecos_sessions')
      .insert({
        title: sanitizeInput(title),
        promotion: sanitizeInput(promotion),
        session_date: session_date,
        location: sanitizeInput(location),
        capacity: parseInt(capacity),
        description: description ? sanitizeInput(description) : null,
        status: 'planned'
      })
      .select()
      .single();

    if (error) {
      throw handleApiError(error);
    }

    return NextResponse.json({ data }, { status: 201 });
  } catch (error) {
    const appError = handleApiError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.statusCode }
    );
  }
}