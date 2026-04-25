import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { handleApiError, sanitizeInput } from '@/lib/errors';
import type { ECOSSession } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    const promotion = searchParams.get('promotion');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    let query = supabase
      .from('ecos_sessions')
      .select('*', { count: 'exact' })
      .order('session_date', { ascending: false });

    if (status) {
      query = query.eq('status', status);
    }

    if (promotion) {
      query = query.eq('promotion', promotion);
    }

    // Pagination
    const offset = (page - 1) * limit;
    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    if (error) {
      throw handleApiError(error);
    }

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

    const { data, error } = await supabase
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