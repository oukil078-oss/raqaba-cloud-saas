'use client';
import { CrudPage } from '@/components/dashboard/CrudPage';
import { formatDzd } from '@/lib/utils';
export default function Page(){return <CrudPage title="الزبائن" description="معلومات العملاء وتاريخ الشراء." endpoint="/customers" fields={[{name:'name',label:'الاسم',required:true},{name:'phone',label:'الهاتف'},{name:'email',label:'البريد',type:'email'},{name:'address',label:'العنوان'},{name:'notes',label:'ملاحظات',type:'textarea'}]} columns={[{key:'name',label:'الاسم'},{key:'phone',label:'الهاتف'},{key:'totalSpent',label:'إجمالي الشراء',render:r=>formatDzd(r.totalSpent)}]}/>}
