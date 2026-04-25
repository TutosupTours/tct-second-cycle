import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { handleApiError } from '@/lib/errors';
import type { SessionRegistration } from '@/lib/types';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const sessionId = searchParams.get('session_id');
    const studentId = searchParams.get('student_id');
    const status = searchParams.get('status');

    let query = supabase
      .from('session_registrations')
      .select(`
        *,
        sessions:ecos_sessions(title, session_date, location),
        students:students(first_name, last_name, email, promotion)
      `)
      .order('registration_date', { ascending: false });

    if (sessionId) {
      query = query.eq('session_id', sessionId);
    }

    if (studentId) {
      query = query.eq('student_id', studentId);
    }

    if (status) {
      query = query.eq('status', status);
    }

    const { data, error } = await query;

    if (error) {
      throw handleApiError(error);
    }

    return NextResponse.json({ data: data as SessionRegistration[] });
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
    const { session_id, student_id, notes } = body;

    if (!session_id || !student_id) {
      return NextResponse.json(
        { error: 'Session ID and Student ID are required' },
        { status: 400 }
      );
    }

    // Check if student is already registered for this session
    const { data: existingRegistration } = await supabase
      .from('session_registrations')
      .select('id')
      .eq('session_id', session_id)
      .eq('student_id', student_id)
      .single();

    if (existingRegistration) {
      return NextResponse.json(
        { error: 'Student is already registered for this session' },
        { status: 409 }
      );
    }

    // Check session capacity
    const { data: session } = await supabase
      .from('ecos_sessions')
      .select('capacity')
      .eq('id', session_id)
      .single();

    const { count: registrationCount } = await supabase
      .from('session_registrations')
      .select('*', { count: 'exact', head: true })
      .eq('session_id', session_id)
      .eq('status', 'approved');

    if (registrationCount && session && registrationCount >= session.capacity) {
      return NextResponse.json(
        { error: 'Session is at full capacity' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('session_registrations')
      .insert({
        session_id,
        student_id,
        status: 'pending',
        payment_status: 'pending',
        notes: notes || null
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
    const { id, status, payment_status, approved_by, notes } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Registration ID is required' },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (status) updateData.status = status;
    if (payment_status) updateData.payment_status = payment_status;
    if (notes !== undefined) updateData.notes = notes;

    if (status === 'approved') {
      updateData.approved_by = approved_by;
      updateData.approved_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('session_registrations')
      .update(updateData)
      .eq('id', id)
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