'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { formatDzd } from '@/lib/utils';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
export default function Receipt(){const {id}=useParams(); const [data,setData]=useState<any>(); useEffect(()=>{api<any>(`/sales/${id}/receipt`).then(r=>setData(r.data))},[id]); if(!data)return <p>جاري التحميل...</p>; return <div className="mx-auto max-w-2xl"><Card><div className="text-center"><h1 className="text-3xl font-black">{data.business.name}</h1><p>{data.business.address}</p><p className="font-bold">وصل بيع: {data.invoiceNumber}</p></div><table className="mt-6 w-full text-sm"><tbody>{data.items.map((it:any)=><tr key={it.id} className="border-b"><td className="py-3">{it.product.name}</td><td>{it.quantity}</td><td>{formatDzd(it.unitPrice)}</td><td className="font-bold">{formatDzd(it.total)}</td></tr>)}</tbody></table><div className="mt-6 space-y-2 text-lg"><p>المجموع: {formatDzd(data.subtotal)}</p><p>الخصم: {formatDzd(data.discount)}</p><p className="text-2xl font-black">الإجمالي: {formatDzd(data.total)}</p></div><Button onClick={()=>window.print()} className="mt-6 w-full">طباعة</Button></Card></div>}
