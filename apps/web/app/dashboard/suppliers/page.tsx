'use client';
import { CrudPage } from '@/components/dashboard/CrudPage';
export default function Page(){return <CrudPage title="الموردون" description="إدارة جهات التوريد وطلبات الشراء." endpoint="/suppliers" fields={[{name:'name',label:'اسم المورد',required:true},{name:'contact',label:'مسؤول التواصل'},{name:'phone',label:'الهاتف'},{name:'email',label:'البريد',type:'email'},{name:'address',label:'العنوان'},{name:'notes',label:'ملاحظات',type:'textarea'}]} columns={[{key:'name',label:'المورد'},{key:'contact',label:'التواصل'},{key:'phone',label:'الهاتف'}]}/>}
