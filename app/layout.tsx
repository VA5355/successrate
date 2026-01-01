"use client";
import {Inter} from 'next/font/google'
import './globals.css'
import {ReduxProvider} from '@/providers/ReduxProvider'
import {Toaster} from 'react-hot-toast';
import {useEffect} from 'react';
import addInterceptor from '@/libs/interceptor';
import {API} from '@/libs/client';
import {ThemeProvider} from "@/providers/ThemeProvider";
import { EquityReduxProvider } from '@/providers/EquityReduxProvider';
import Analytics from './analytics/Analytics';
import { TradeReduxProvider } from '@/providers/TradeReduxProvider';
import { ModalProvider } from '@/providers/ModalProvider';
import { ModalRoot } from '@/components/common/service/ModalService';

const inter = Inter({subsets: ['latin']})


export default function RootLayout({
                                       children,
                                   }: {
    children: React.ReactNode
}) {

    useEffect(() => {
        addInterceptor(API)
    }, [])
    return (
        <html lang="en" className=''>
        <title>Store Notify Stocks</title>
        <link rel="icon" href="/favicon.ico" sizes="any"/>
        <body className={inter.className}>
        <ReduxProvider>
            <EquityReduxProvider>
                <TradeReduxProvider>
            <ThemeProvider>
                 <ModalProvider>
                <>  <Analytics />
                    <Toaster/>
                    <ModalRoot/>
                    {children}
                </></ModalProvider>
            </ThemeProvider>
             </TradeReduxProvider>
            </EquityReduxProvider>
        </ReduxProvider>
        </body>
        </html>
    )
}
