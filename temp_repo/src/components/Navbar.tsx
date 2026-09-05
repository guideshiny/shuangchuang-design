/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Cpu, CheckSquare, MessageSquare, BookOpen, Database, BarChart3, Bot } from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function Navbar({ activeTab, setActiveTab }: NavbarProps) {
  const navItems = [
    { id: 'coach', label: 'AI备赛教练', icon: Bot, prd: 'Hero' },
    { id: 'screening', label: '智能初筛', icon: CheckSquare, prd: 'P0' },
    { id: 'coaching', label: '诊断与指导', icon: Cpu, prd: 'P0' },
    { id: 'mockqa', label: '模拟答辩', icon: MessageSquare, prd: 'P1' },
    { id: 'skills', label: '专家经验库', icon: BookOpen, prd: 'P1' },
    { id: 'cases', label: '历史案例库', icon: Database, prd: 'P1' },
    { id: 'dashboard', label: '数据看板', icon: BarChart3, prd: 'P2' },
  ];

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-xl border-b border-gray-200 shadow-sm transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('screening')}>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px] shadow-md shadow-blue-500/10">
              <div className="flex h-full w-full items-center justify-center rounded-[7px] bg-white">
                <Cpu className="h-4 w-4 text-blue-600" />
              </div>
            </div>
            <div>
              <span className="font-display font-semibold text-sm tracking-tight text-gray-900 hover:text-blue-600 transition-colors">
                创新大赛AI助手
              </span>
              <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 font-mono">
                PRD Sandbox
              </span>
            </div>
          </div>

          {/* Nav Items */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center space-x-1.5 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-300 group ${
                    isActive
                      ? 'text-white bg-[#0071E3] border border-transparent shadow-sm'
                      : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100 border border-transparent'
                  }`}
                >
                  <Icon className={`h-3.5 w-3.5 transition-transform duration-300 ${isActive ? 'scale-110 text-white' : 'text-gray-400 group-hover:text-gray-600'}`} />
                  <span>{item.label}</span>
                  {/* PRD Level tag */}
                  <span className={`text-[8px] px-1 rounded-sm scale-90 ${
                    item.prd === 'P0' 
                      ? isActive 
                        ? 'bg-white/20 text-white border border-white/10'
                        : 'bg-red-50 text-red-600 border border-red-100' 
                      : item.prd === 'P1'
                        ? isActive
                          ? 'bg-white/20 text-white border border-white/10'
                          : 'bg-amber-50 text-amber-700 border border-amber-100'
                        : isActive
                          ? 'bg-white/20 text-white border border-white/10'
                          : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}>
                    {item.prd}
                  </span>
                </button>
              );
            })}
          </div>

          {/* User profile & status */}
          <div className="flex items-center space-x-3 text-xs">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-gray-700 font-semibold">李组委</span>
              <span className="text-[10px] text-gray-500 font-mono">赛事管理员</span>
            </div>
            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-semibold text-gray-800 border border-gray-200">
              李
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Submenu tabs */}
      <div className="md:hidden flex items-center space-x-1 overflow-x-auto px-4 py-2 border-t border-gray-200 bg-white">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                isActive
                  ? 'text-white bg-[#0071E3]'
                  : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </nav>
  );
}
