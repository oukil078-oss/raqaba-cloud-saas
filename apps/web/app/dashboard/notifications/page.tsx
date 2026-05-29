'use client';
import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatDate } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/dashboard/PageHeader';
export default function Notifications(){const [rows,setRows]=useState<any[]>([]); useEffect(()=>{api<any>('/notifications').then(r=>setRows(r.data))},[]); return <><PageHeader title="الإشعارات" description="تنبيهات المخزون والعمليات."/><div className="space-y-3">{rows.map(n=><Card key={n.id} className={n.readAt?'opacity-60':''}><div className="flex justify-between gap-4"><div><h3 className="font-black">{n.title}</h3><p className="mt-2 text-slate-600">{n.message}</p><p className="mt-2 text-sm text-slate-400">{formatDate(n.createdAt)}</p></div>{!n.readAt&&<button onClick={()=>api(`/notifications/${n.id}/read`,{method:'PATCH'}).then(()=>setRows(rows.map(x=>x.id===n.id?{...x,readAt:new Date()}:x)))} className="rounded-2xl bg-raqaba-50 px-4 py-2 font-bold text-raqaba-700">تعليم كمقروء</button>}</div></Card>)}</div></>}
