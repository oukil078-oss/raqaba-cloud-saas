'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { authApi, clearToken, getToken } from '@/lib/api';

type AuthState = { user:any; business:any; loading:boolean; refresh:()=>Promise<void>; logout:()=>void };
const AuthContext = createContext<AuthState | null>(null);
export function AuthProvider({children}:{children:React.ReactNode}){const [state,setState]=useState<any>({user:null,business:null,loading:true}); const router=useRouter(); const pathname=usePathname(); async function refresh(){try{const res=await authApi.me(); setState({user:res.user,business:res.business,loading:false})}catch{clearToken(); setState({user:null,business:null,loading:false}); router.push('/login')}} useEffect(()=>{if(!getToken()){setState((s:any)=>({...s,loading:false})); router.push('/login')}else refresh()},[]); function logout(){clearToken(); router.push('/login')} return <AuthContext.Provider value={{...state,refresh,logout}}>{state.loading?<div className="grid min-h-screen place-items-center bg-slate-50"><div className="rounded-3xl bg-white p-8 font-black shadow-card">جاري تحميل رقابة...</div></div>:children}</AuthContext.Provider>}
export const useAuth=()=>useContext(AuthContext)!;
