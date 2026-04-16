export const dynamic = 'force-dynamic';

// ============================================================
// app/api/widgets/route.ts
//
// GET   -> get user's active widget list (or computed defaults)
// PUT   -> save full widget list (reorder / bulk update)
// PATCH -> add or remove a single widget
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';
import { getDefaultWidgets, WIDGET_REGISTRY } from '@/lib/widgets/registry';

const VALID_IDS = new Set(WIDGET_REGISTRY.map(w => w.id));

// -- GET: Current widget config -----------------------------------

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const db = supabase;
  const { data: profile } = await db.from('users')
    .select('dashboard_widgets, goals, foundational_motivator')
    .eq('id', user.id)
    .single();

  const goals = profile?.goals ?? [];
  const motivator = profile?.foundational_motivator ?? 'general';

  // If user has no saved config, compute defaults
  const widgets: string[] = profile?.dashboard_widgets ?? getDefaultWidgets(goals, motivator);

  return NextResponse.json({
    widgets,
    isDefault: !profile?.dashboard_widgets,
    registry: WIDGET_REGISTRY.filter(w => !w.requiresGoal || goals.includes(w.requiresGoal)),
  });
}

// -- PUT: Save full widget list -----------------------------------

export async function PUT(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { widgets } = await req.json();

  if (!Array.isArray(widgets)) {
    return NextResponse.json({ error: 'widgets must be an array' }, { status: 400 });
  }

  // Validate all widget IDs
  const invalid = widgets.filter((id: string) => !VALID_IDS.has(id));
  if (invalid.length > 0) {
    return NextResponse.json({ error: `Invalid widget IDs: ${invalid.join(', ')}` }, { status: 400 });
  }

  // Ensure always-on widgets are included
  const alwaysOn = WIDGET_REGISTRY.filter(w => w.alwaysOn).map(w => w.id);
  const finalWidgets = [...new Set([...alwaysOn, ...widgets])];

  const db = supabase;
  await db.from('users').update({ dashboard_widgets: finalWidgets }).eq('id', user.id);

  return NextResponse.json({ widgets: finalWidgets });
}

// -- PATCH: Add or remove a single widget -------------------------

export async function PATCH(req: NextRequest) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { action, widgetId } = await req.json();

  if (!['add', 'remove'].includes(action) || !widgetId) {
    return NextResponse.json({ error: 'Requires action (add|remove) and widgetId' }, { status: 400 });
  }

  if (!VALID_IDS.has(widgetId)) {
    return NextResponse.json({ error: `Invalid widget ID: ${widgetId}` }, { status: 400 });
  }

  // Check if trying to remove an always-on widget
  const widgetDef = WIDGET_REGISTRY.find(w => w.id === widgetId);
  if (action === 'remove' && widgetDef?.alwaysOn) {
    return NextResponse.json({ error: `Cannot remove ${widgetDef.name}` }, { status: 400 });
  }

  const db = supabase;
  const { data: profile } = await db.from('users')
    .select('dashboard_widgets, goals, foundational_motivator')
    .eq('id', user.id)
    .single();

  // Start from saved config or compute defaults
  let current: string[] = profile?.dashboard_widgets
    ?? getDefaultWidgets(profile?.goals ?? [], profile?.foundational_motivator ?? 'general');

  if (action === 'add') {
    if (!current.includes(widgetId)) {
      current.push(widgetId);
    }
  } else {
    current = current.filter(id => id !== widgetId);
  }

  await db.from('users').update({ dashboard_widgets: current }).eq('id', user.id);

  return NextResponse.json({ widgets: current });
}
