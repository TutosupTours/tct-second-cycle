import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { handleApiError, sanitizeInput } from '@/lib/errors';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search');
    const active = searchParams.get('active');

    let query = supabase
      .from('students')
      .select('*')
      .order('nom');

    if (search) {
      query = query.or(`nom.ilike.%${sanitizeInput(search)}%,prenom.ilike.%${sanitizeInput(search)}%,login_id.ilike.%${sanitizeInput(search)}%`);
    }

    if (active !== null) {
      query = query.eq('is_active', active === 'true');
    }

    const { data, error } = await query;

    if (error) {
      throw handleApiError(error);
    }

    return NextResponse.json({ data });
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
    const { login_id, prenom, nom, email, phone, promotion, niveau } = body;

    if (!login_id || !prenom || !nom || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('students')
      .insert({
        login_id: sanitizeInput(login_id).toLowerCase(),
        prenom: sanitizeInput(prenom),
        nom: sanitizeInput(nom),
        email: sanitizeInput(email).toLowerCase(),
        phone: phone ? sanitizeInput(phone) : null,
        promotion: sanitizeInput(promotion),
        niveau: sanitizeInput(niveau),
        is_active: true
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

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { login_id, ...updates } = body;

    if (!login_id) {
      return NextResponse.json(
        { error: 'login_id is required' },
        { status: 400 }
      );
    }

    // Sanitize updates
    const sanitizedUpdates: any = {};
    for (const [key, value] of Object.entries(updates)) {
      if (typeof value === 'string') {
        sanitizedUpdates[key] = sanitizeInput(value);
      } else {
        sanitizedUpdates[key] = value;
      }
    }

    const { data, error } = await supabase
      .from('students')
      .update(sanitizedUpdates)
      .eq('login_id', login_id)
      .select()
      .single();

    if (error) {
      throw handleApiError(error);
    }

    return NextResponse.json({ data });
  } catch (error) {
    const appError = handleApiError(error);
    return NextResponse.json(
      { error: appError.message },
      { status: appError.statusCode }
    );
  }
}