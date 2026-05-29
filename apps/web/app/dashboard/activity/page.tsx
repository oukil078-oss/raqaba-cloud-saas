'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
export default function Activity(){const [rows,setRows]=useState<any[]>([]); useEffect(()=>{api<any>('/audit-logs').then(r=>setRows(r.data))},[]); return <><PageHeader title="سجل النشاط" description="كل عملية مهمة داخل النظام لأغراض المراجعة."/><Card className="overflow-hidden p-0"><table className="w-full text-sm"><thead className="bg-slate-50"><tr><th className="p-4 text-right">المستخدم</th><th className="p-4 text-right">الإجراء</th><th className="p-4 text-right">الكيان</th><th className="p-4 text-right">التاريخ</th></tr></thead><tbody>{rows.map(r=><tr key={r.id} className="border-t"><td className="p-4">{r.user?.fullName||'النظام'}</td><td className="p-4 font-bold">{r.action}</td><td className="p-4">{r.entity}</td><td className="p-4">{formatDate(r.createdAt)}</td></tr>)}</tbody></table></Card></>}
