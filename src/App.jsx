import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Menu, X, ArrowRight, ArrowDown, Send, Image as ImageIcon, Eye, Terminal, Star, Edit2, Check, Trash2, Instagram, LogOut, Lock, LayoutDashboard, FileText, Settings, ScrollText, Mail, Clock, PenTool } from 'lucide-react';
import api from './utils/api';

const parseDiscordMarkdown = (text) => {
  if (!text) return null;
  return text.split('\n').map((line, i) => {
    let isH1 = false;
    let isSmall = false;
    let processedLine = line;

    if (processedLine.startsWith('# ')) {
      isH1 = true;
      processedLine = processedLine.substring(2);
    } else if (processedLine.startsWith('-# ')) {
      isSmall = true;
      processedLine = processedLine.substring(3);
    }

    let html = processedLine
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");

    html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-black">$1</strong>');
    html = html.replace(/__(.*?)__/g, '<u class="underline underline-offset-4">$1</u>');
    html = html.replace(/~~(.*?)~~/g, '<del class="decoration-4 decoration-black/50">$1</del>');
    html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');

    if (isH1) {
      return <span key={`md-h1-${i}`} className="block text-[1.5em] font-black my-[0.5em] leading-tight break-words" dangerouslySetInnerHTML={{ __html: html || ' ' }} />;
    } else if (isSmall) {
      return <span key={`md-sm-${i}`} className="block text-[0.7em] text-gray-500 my-[0.2em] font-medium break-words" dangerouslySetInnerHTML={{ __html: html || ' ' }} />;
    } else {
      return <span key={`md-p-${i}`} className="block min-h-[1.5em] break-words" dangerouslySetInnerHTML={{ __html: html || ' ' }} />;
    }
  });
};

const PostCardRenderer = ({ title, content, image, date }) => {
  const [page, setPage] = useState(1);
  const hasImage = !!image;

  const len = (content || '').length;
  let textClass = "text-xl md:text-4xl leading-snug";
  if (len > 30) textClass = "text-lg md:text-3xl leading-relaxed";
  if (len > 80) textClass = "text-base md:text-2xl leading-relaxed";
  if (len > 150) textClass = "text-sm md:text-xl leading-relaxed";
  if (len > 300) textClass = "text-xs md:text-base leading-normal";

  const getFormattedDate = () => {
    if (date) return date.split(' ')[0].replace(/-/g, '/');
    const d = new Date();
    return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
  };

  return (
    <div className="flex flex-col items-center w-full my-4">
      <div className="w-full max-w-2xl aspect-[4/3] bg-white border-[4px] md:border-8 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] md:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] relative flex flex-col overflow-hidden group transition-all duration-300">
        {page === 1 ? (
          <div className="flex flex-col h-full p-4 md:p-10 relative z-10 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
             <h3 className="text-2xl md:text-5xl font-black mb-3 md:mb-6 truncate tracking-tight">{title || '天母匿名'}</h3>
             <div className="w-full h-1 md:h-2 bg-black mb-3 md:mb-6 shrink-0"></div>
             <div className={`flex-grow overflow-y-auto ${textClass} font-bold text-black pb-12 md:pb-16 break-words`}>
               {content ? parseDiscordMarkdown(content) : '內容'}
             </div>
             <div className="absolute bottom-3 right-3 md:bottom-8 md:right-8 flex items-end gap-1.5 md:gap-3 bg-white/90 p-1 md:p-2 border-[3px] md:border-2 border-black transform rotate-1">
                <span className="font-black font-mono text-xs md:text-xl pb-0.5 md:pb-1 tracking-widest">{getFormattedDate()}</span>
                <div className="bg-black w-8 h-8 md:w-14 md:h-14 flex items-center justify-center p-1 md:p-1.5 border-[3px] md:border-2 border-black">
                  <img src="/watermarked_img_13241597107139428758.jpg" alt="Logo" className="w-full h-full object-contain mix-blend-screen" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
             </div>
          </div>
        ) : (
          <div className="flex flex-col h-full p-3 md:p-8 relative z-10 bg-[linear-gradient(transparent_95%,#e5e7eb_95%)] [background-size:100%_24px]">
             <div className="w-full h-full border-[3px] md:border-4 border-black p-2 flex items-center justify-center bg-white shadow-[inset_4px_4px_0px_0px_rgba(0,0,0,0.1)] overflow-hidden">
                <img src={image} className="max-w-full max-h-full object-contain" alt="Post Image" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             </div>
             <div className="absolute bottom-3 right-3 md:bottom-8 md:right-8 bg-black w-8 h-8 md:w-14 md:h-14 flex items-center justify-center p-1 md:p-1.5 border-[3px] md:border-2 border-black transform -rotate-2">
                <img src="/watermarked_img_13241597107139428758.jpg" alt="Logo" className="w-full h-full object-contain mix-blend-screen" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             </div>
          </div>
        )}
      </div>

      {hasImage && (
        <div className="mt-6 md:mt-8 flex gap-3 md:gap-4">
           <button onClick={() => setPage(1)} className={`px-4 py-1.5 md:px-6 md:py-2 border-[3px] md:border-4 border-black font-black text-xs md:text-base transition-transform active:translate-y-1 active:shadow-none hover:-translate-y-1 ${page === 1 ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>PAGE 01 / 文字</button>
           <button onClick={() => setPage(2)} className={`px-4 py-1.5 md:px-6 md:py-2 border-[3px] md:border-4 border-black font-black text-xs md:text-base transition-transform active:translate-y-1 active:shadow-none hover:-translate-y-1 ${page === 2 ? 'bg-blue-600 text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>PAGE 02 / 附圖</button>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = ({ stats, igStatus, loading, error, onRetry }) => {
  if (loading) {
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-pulse">{[1, 2, 3, 4].map(item => <div key={item} className="h-28 bg-gray-200 border-4 border-black" />)}</div>;
  }

  if (error) {
    return <div className="bg-white border-4 border-black p-8 text-center shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
      <h2 className="text-xl font-black mb-3">Dashboard 載入失敗</h2>
      <p className="font-bold text-gray-600 mb-5">{error}</p>
      <button onClick={onRetry} className="bg-blue-600 text-white border-4 border-black px-6 py-3 font-black active:translate-y-1">重新載入</button>
    </div>;
  }

  const total = stats?.totalPosts || 0;
  const imageCount = stats?.imagePostsCount || 0;
  const textCount = stats?.textPostsCount || 0;
  const statusCounts = stats?.statusCounts || {};
  const trend = stats?.trend || [];
  const maxTrend = Math.max(...trend.map(item => item.count), 1);
  const recentPosts = stats?.recentPosts || [];
  const isEmpty = total === 0;
  const cards = [
    ['投稿總數', total, 'bg-blue-50'],
    ['今日投稿', stats?.periodCounts?.today || 0, 'bg-yellow-50'],
    ['本週投稿', stats?.periodCounts?.week || 0, 'bg-green-50'],
    ['本月投稿', stats?.periodCounts?.month || 0, 'bg-pink-50'],
    ['待審核', statusCounts.pending || 0, 'bg-orange-50'],
    ['已核准／發布', (statusCounts.approved || 0) + (statusCounts.published || 0), 'bg-indigo-50'],
    ['有圖片', imageCount, 'bg-cyan-50'],
    ['純文字', textCount, 'bg-gray-50']
  ];

  return <div className="space-y-5 md:space-y-7 animate-[fadeIn_0.5s_ease-out]">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><p className="text-xs font-mono font-bold text-gray-500 tracking-widest">ADMIN OVERVIEW</p><h1 className="text-2xl md:text-4xl font-black">營運總覽</h1></div>
      <div className={`px-3 py-1 border-2 border-black font-black text-xs ${igStatus?.connected ? 'bg-green-300' : 'bg-gray-200'}`}>Instagram：{igStatus?.connected ? '已連線（手動發布）' : '未連線'}</div>
    </div>

    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">{cards.map(([label, value, color]) => <div key={label} className={`${color} bg-white border-4 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]`}><p className="font-bold text-xs md:text-sm text-gray-600">{label}</p><p className="text-2xl md:text-4xl font-black mt-1">{value}</p></div>)}</div>

    {isEmpty ? <div className="bg-white border-4 border-dashed border-gray-400 p-10 text-center"><ScrollText className="mx-auto mb-3 text-gray-400" size={34} /><p className="font-black text-lg">目前還沒有投稿資料</p><p className="text-gray-500 font-bold mt-1">收到第一筆投稿後，這裡會顯示真實統計。</p></div> : <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-7">
        <section className="lg:col-span-2 bg-white border-4 border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
          <div className="flex justify-between items-center mb-5"><div><p className="text-xs font-mono font-bold text-gray-500">LAST 7 DAYS</p><h2 className="text-xl font-black">投稿趨勢</h2></div><span className="text-xs font-bold text-gray-500">每日投稿數</span></div>
          <div className="h-48 flex items-end gap-2 md:gap-3 border-b-2 border-l-2 border-black px-2 pt-4">{trend.map(item => <div key={item.bucket} className="flex-1 h-full flex flex-col justify-end items-center gap-1"><span className="text-xs font-black">{item.count}</span><div className="w-full max-w-12 bg-blue-600 border-2 border-black min-h-1" style={{ height: `${Math.max((item.count / maxTrend) * 78, item.count ? 5 : 1)}%` }} title={`${item.bucket}: ${item.count}`} /><span className="text-[10px] md:text-xs font-bold rotate-[-35deg] origin-top mt-2">{item.bucket.slice(5)}</span></div>)}</div>
        </section>
        <section className="bg-white border-4 border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><p className="text-xs font-mono font-bold text-gray-500">CONTENT MIX</p><h2 className="text-xl font-black mb-5">投稿類型</h2><div className="space-y-5"><div><div className="flex justify-between font-black mb-1"><span>有圖片</span><span>{imageCount}</span></div><div className="h-5 bg-gray-100 border-2 border-black"><div className="h-full bg-cyan-400" style={{ width: `${total ? (imageCount / total) * 100 : 0}%` }} /></div></div><div><div className="flex justify-between font-black mb-1"><span>純文字</span><span>{textCount}</span></div><div className="h-5 bg-gray-100 border-2 border-black"><div className="h-full bg-gray-300" style={{ width: `${total ? (textCount / total) * 100 : 0}%` }} /></div></div></div></section>
      </div>
      <section className="bg-white border-4 border-black p-4 md:p-6 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"><div className="flex items-center justify-between mb-4"><div><p className="text-xs font-mono font-bold text-gray-500">LATEST SUBMISSIONS</p><h2 className="text-xl font-black">最近投稿</h2></div><span className="text-xs font-bold text-gray-500">顯示最近 {recentPosts.length} 筆</span></div>{recentPosts.length ? <div className="divide-y-2 divide-black">{recentPosts.map(post => <div key={post.id} className="py-3 flex gap-3 items-center"><div className="w-12 h-12 shrink-0 border-2 border-black bg-gray-100 flex items-center justify-center overflow-hidden">{post.image ? <img src={post.image} alt="" className="w-full h-full object-cover" onError={e => { e.currentTarget.style.display = 'none'; }} /> : <FileText size={18} />}</div><div className="min-w-0 flex-1"><div className="font-black truncate">{post.title}</div><div className="text-xs font-bold text-gray-500 truncate">{post.content}</div></div><span className="hidden sm:inline-block px-2 py-1 border-2 border-black text-xs font-black">{post.status}</span><time className="text-[10px] md:text-xs font-mono font-bold text-gray-500 shrink-0">{post.date}</time></div>)}</div> : <p className="font-bold text-gray-500">目前沒有最近投稿。</p>}</section>
    </>}
  </div>;
};

const AdminReview = ({ posts, pagination, filters, setFilters, handleStatusChange, handleSaveEdit, handleDownloadIGImage, handleCopyIGTitle }) => {
  const [activeTab, setActiveTab] = useState('pending');
  const [editingPost, setEditingPost] = useState(null);

  const filteredPosts = (posts || []).filter(p => activeTab === 'approved' ? (p.status === 'approved' || p.status === 'published') : p.status === activeTab);
  const pendingCount = (posts || []).filter(p => p.status === 'pending').length;
  const approvedCount = (posts || []).filter(p => p.status === 'approved' || p.status === 'published').length;
  const updateFilter = (key, value) => setFilters(current => ({ ...current, [key]: value, page: 1 }));

  return (
    <div className="animate-[fadeIn_0.5s_ease-out]">
      <div className="flex gap-2 md:gap-4 mb-4 md:mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => { setActiveTab('pending'); setEditingPost(null); updateFilter('status', 'pending'); }}
          className={`shrink-0 px-4 py-2 md:px-8 md:py-3 font-black text-sm md:text-lg border-[3px] md:border-4 border-black transition-all ${activeTab === 'pending' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] md:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-gray-100'}`}
        >
          待審核 ({pendingCount})
        </button>
        <button 
          onClick={() => { setActiveTab('approved'); setEditingPost(null); updateFilter('status', 'approved,published'); }}
          className={`shrink-0 px-4 py-2 md:px-8 md:py-3 font-black text-sm md:text-lg border-[3px] md:border-4 border-black transition-all ${activeTab === 'approved' ? 'bg-black text-white shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] md:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] translate-x-[-2px] translate-y-[-2px]' : 'bg-white hover:bg-gray-100'}`}
        >
          審核完畢 ({approvedCount})
        </button>
      </div>
      <div className="bg-white border-[3px] md:border-4 border-black p-3 md:p-4 mb-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-3">
        <input value={filters.q} onChange={e => updateFilter('q', e.target.value)} placeholder="搜尋標題／內容" className="border-2 border-black p-2 font-bold" />
        <select value={filters.type} onChange={e => updateFilter('type', e.target.value)} className="border-2 border-black p-2 font-bold"><option value="">全部類型</option><option value="image">有圖片</option><option value="text">純文字</option></select>
        <input type="date" value={filters.from} onChange={e => updateFilter('from', e.target.value)} className="border-2 border-black p-2 font-bold" />
        <input type="date" value={filters.to} onChange={e => updateFilter('to', e.target.value)} className="border-2 border-black p-2 font-bold" />
      </div>

      <div className="flex flex-col gap-4 md:gap-8">
        {filteredPosts.length === 0 ? (
          <div className="border-[3px] md:border-4 border-dashed border-gray-400 p-8 md:p-12 text-center text-gray-500 font-bold font-mono text-sm md:text-lg bg-white truncate">
            目前沒有資料 ✦
          </div>
        ) : (
          filteredPosts.map(post => (
            <div key={post.id} className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col overflow-hidden">
              <div className="bg-black text-white px-3 py-2 md:px-4 md:py-3 text-xs md:text-sm font-mono font-bold flex justify-between items-center overflow-hidden">
                <span className="truncate mr-2">POST_ID: {post.id}</span>
                <span className="shrink-0">{post.date}</span>
              </div>

              {editingPost?.id === post.id ? (
                <div className="p-4 md:p-8 flex flex-col gap-4 md:gap-6 bg-gray-50">
                  <div>
                    <label className="block font-black mb-1 md:mb-2 text-sm md:text-base">編輯標題</label>
                    <input value={editingPost.title} onChange={e => setEditingPost({...editingPost, title: e.target.value})} className="w-full border-[3px] md:border-4 border-black p-2 md:p-3 font-bold focus:outline-none focus:border-blue-600 text-sm md:text-base" />
                  </div>
                  <div>
                    <label className="block font-black mb-1 md:mb-2 text-sm md:text-base">編輯內容</label>
                    <textarea value={editingPost.content} onChange={e => setEditingPost({...editingPost, content: e.target.value})} className="w-full border-[3px] md:border-4 border-black p-2 md:p-3 h-32 md:h-48 resize-none font-bold focus:outline-none focus:border-blue-600 text-sm md:text-base" />
                  </div>
                  <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4">
                    <button onClick={() => {
                      if (!editingPost.title.trim() || !editingPost.content.trim()) return;
                      handleSaveEdit(editingPost);
                      setEditingPost(null);
                    }} className="flex-1 min-w-[120px] bg-green-500 text-white px-3 py-2 md:px-4 md:py-3 font-black text-sm md:text-base border-[3px] md:border-4 border-black hover:bg-green-600 active:translate-y-1 transition-all">儲存修改</button>
                    <button onClick={() => setEditingPost(null)} className="flex-1 min-w-[120px] bg-white text-black px-3 py-2 md:px-4 md:py-3 font-black text-sm md:text-base border-[3px] md:border-4 border-black hover:bg-gray-100 active:translate-y-1 transition-all">取消</button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="p-3 md:p-6 bg-gray-100 border-b-[3px] md:border-b-4 border-black overflow-hidden flex justify-center bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">
                    <PostCardRenderer title={post.title} content={post.content} image={post.image} date={post.date} />
                  </div>
                  <div className="p-3 md:p-4 flex flex-wrap sm:flex-nowrap gap-2 md:gap-4 bg-white">
                    {activeTab === 'pending' ? (
                      <>
                        <button onClick={() => handleStatusChange(post.id, 'approved')} className="flex-1 min-w-[90px] flex items-center justify-center gap-1 md:gap-2 bg-blue-600 text-white px-2 py-2 md:px-4 md:py-3 font-black text-xs md:text-base border-[3px] md:border-4 border-black hover:bg-blue-700 active:translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"><Check size={16} className="md:w-5 md:h-5 shrink-0" /> <span className="truncate">核准</span></button>
                        <button onClick={() => handleStatusChange(post.id, 'rejected')} className="flex-1 min-w-[90px] flex items-center justify-center gap-1 md:gap-2 bg-red-500 text-white px-2 py-2 md:px-4 md:py-3 font-black text-xs md:text-base border-[3px] md:border-4 border-black hover:bg-red-600 active:translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"><Trash2 size={16} className="md:w-5 md:h-5 shrink-0" /> <span className="truncate">拒絕</span></button>
                        <button onClick={() => setEditingPost(post)} className="flex-1 min-w-[90px] flex items-center justify-center gap-1 md:gap-2 bg-yellow-400 text-black px-2 py-2 md:px-4 md:py-3 font-black text-xs md:text-base border-[3px] md:border-4 border-black hover:bg-yellow-500 active:translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all"><Edit2 size={16} className="md:w-5 md:h-5 shrink-0" /> <span className="truncate">編輯</span></button>
                      </>
                    ) : (
                      <div className="w-full">
                        <div className="text-center font-black text-sm md:text-lg mb-2 md:mb-3">Instagram 手動發布</div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4">
                          <button onClick={() => handleDownloadIGImage(post.id)} className="w-full flex items-center justify-center gap-2 bg-black text-white px-3 py-3 md:px-4 md:py-4 font-black text-sm md:text-xl border-[3px] md:border-4 border-black hover:bg-pink-600 active:translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                            <Instagram size={18} className="md:w-6 md:h-6 shrink-0" /> <span className="truncate">下載圖片</span>
                          </button>
                          <button onClick={() => handleCopyIGTitle(post.date)} className="w-full flex items-center justify-center gap-2 bg-white text-black px-3 py-3 md:px-4 md:py-4 font-black text-sm md:text-xl border-[3px] md:border-4 border-black hover:bg-blue-50 active:translate-y-1 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none transition-all">
                            <FileText size={18} className="md:w-6 md:h-6 shrink-0" /> <span className="truncate">複製標題</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const AdminSettings = ({ settings, setSettings, igStatus, handleIgConnect, handleIgDisconnect }) => {
  const togglePostEnabled = async () => {
    const newVal = !settings.isPostEnabled;
    setSettings({ ...settings, isPostEnabled: newVal });
    try {
      await api.put('/admin/settings', { ...settings, isPostEnabled: newVal });
    } catch(err) {
      setSettings({ ...settings, isPostEnabled: !newVal });
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4">網站流量</h3>
          <div className="w-full h-32 md:h-48 border-[3px] md:border-4 border-black relative bg-gray-50 flex items-end p-2 overflow-hidden">
             <svg viewBox="0 0 100 50" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
               <path d="M0,40 Q10,35 15,20 T30,25 T45,10 T60,25 T80,5 T100,0" fill="none" stroke="#0ea5e9" strokeWidth="2" />
             </svg>
          </div>
        </div>
        <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6">
          <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4 flex justify-between items-center">
            <span className="truncate mr-2">開關發帖</span> 
            <div onClick={togglePostEnabled} className={`w-10 h-5 md:w-12 md:h-6 ${settings?.isPostEnabled ? 'bg-blue-600' : 'bg-gray-400'} rounded-full relative border-2 border-black cursor-pointer shrink-0`}>
              <div className={`w-3 h-3 md:w-4 md:h-4 bg-white border-2 border-black rounded-full absolute top-[1px] md:top-0.5 transition-all ${settings?.isPostEnabled ? 'right-[1px] md:right-0.5' : 'left-[1px] md:left-0.5'}`}></div>
            </div>
          </h3>
          <p className="font-bold text-gray-500 text-sm md:text-base break-words">目前系統正常接收新投稿。</p>
        </div>
      </div>
      <div className="flex flex-col gap-4 md:gap-8">
        <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-4 md:p-6 h-full flex flex-col">
          <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4">Instagram 手動發布</h3>
          <div className="border-[3px] md:border-4 border-black p-3 md:p-4 bg-gray-50 mb-4">
            <p className="font-bold text-sm md:text-base">不使用自動發布 API。請在投稿審核完成後下載圖片並手動發布至 Instagram。</p>
            <p className="font-mono text-xs text-gray-500 mt-2">狀態：{igStatus?.manualPublishing ? '手動發布模式' : '可用'}</p>
          </div>
          <h3 className="text-lg md:text-xl font-black mb-3 md:mb-4">發帖流量</h3>
          <div className="w-full flex-grow min-h-[150px] md:min-h-[200px] border-[3px] md:border-4 border-black relative bg-gray-50 flex items-end p-2 overflow-hidden">
             <svg viewBox="0 0 100 50" className="w-full h-full absolute inset-0" preserveAspectRatio="none">
               <path d="M0,25 L5,40 L15,35 L25,45 L35,25 L45,20 L55,10 L65,30 L75,45 L85,35 L95,40 L100,20" fill="none" stroke="#0ea5e9" strokeWidth="2" />
             </svg>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminLogs = ({ logs }) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-8 h-[60vh] md:h-[70vh] animate-[fadeIn_0.5s_ease-out]">
    <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative transform -rotate-1">
      <div className="bg-black text-white px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-bold border-b-[3px] md:border-b-4 border-black truncate">操作日誌</div>
      <div className="p-3 md:p-4 bg-gray-100 flex-grow font-mono text-xs md:text-sm space-y-1.5 md:space-y-2 overflow-y-auto break-all">
        {logs?.map(log => (
          <p key={log.id}>
            <span className="text-gray-400 shrink-0">[{new Date(log.createdAt).toLocaleTimeString('zh-TW', { hour12: false, hour: '2-digit', minute: '2-digit' })}]</span>
            <span className={log.type === 'ERROR' ? 'text-red-500' : log.type === 'SUCCESS' ? 'text-green-600 font-bold' : log.type === 'WARNING' ? 'text-yellow-600 font-bold' : ''}> {log.action}</span>
            {log.targetId ? ` ID:${log.targetId}` : ''}
          </p>
        ))}
      </div>
    </div>
    <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] flex flex-col relative transform rotate-1">
      <div className="bg-black text-white px-3 py-2 md:px-4 md:py-3 text-sm md:text-base font-bold border-b-[3px] md:border-b-4 border-black truncate">網站控制台</div>
      <div className="p-3 md:p-4 bg-[#111] text-green-400 flex-grow font-mono text-xs md:text-sm space-y-1.5 md:space-y-2 overflow-y-auto break-all">
        <p>{'>'} SYSTEM STATUS: ONLINE</p>
        <p>{'>'} DB CONNECTION: ESTABLISHED</p>
        <p>{'>'} MEMORY USAGE: 45MB / 512MB</p>
        <p className="animate-pulse">{'>'} _</p>
      </div>
    </div>
  </div>
);

const useScrollReveal = (threshold = 0.1, delay = 0) => {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef(null);
  const mounted = useRef(true);
  const revealTimer = useRef(null);

  useEffect(() => {
    mounted.current = true;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      if (mounted.current) setIsVisible(true);
      return;
    }

    const fallbackTimer = setTimeout(() => {
      if (mounted.current) setIsVisible(true);
    }, 3000);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          clearTimeout(fallbackTimer);
          revealTimer.current = setTimeout(() => {
            revealTimer.current = null;
            if (mounted.current) setIsVisible(true);
          }, delay);
          if (ref.current) observer.unobserve(ref.current);
        }
      },
      { threshold, rootMargin: '50px' }
    );
    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => {
      mounted.current = false;
      clearTimeout(fallbackTimer);
      if (revealTimer.current) {
        clearTimeout(revealTimer.current);
        revealTimer.current = null;
      }
      if (ref.current) observer.unobserve(ref.current);
    };
  }, [threshold, delay]);

  return [ref, isVisible];
};

const TianmuAnonymous = () => {
  const [isMounted, setIsMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [isEditorAnimating, setIsEditorAnimating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const submittingRef = useRef(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  const [isAdminView, setIsAdminView] = useState(false);
  const [isLoginView, setIsLoginView] = useState(false);
  const [adminTab, setAdminTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const [isPreview, setIsPreview] = useState(false);
  const [newPost, setNewPost] = useState({ title: '天母匿名', content: '', imageFile: null, imagePreview: null });
  const fileInputRef = useRef(null);

  const [posts, setPosts] = useState([]);
  const [postPagination, setPostPagination] = useState({ page: 1, pageSize: 20, total: 0, totalPages: 1 });
  const [postFilters, setPostFilters] = useState({ status: 'pending', type: '', q: '', from: '', to: '', page: 1, pageSize: 20 });
  const [dashboardStats, setDashboardStats] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dashboardError, setDashboardError] = useState('');
  const [settings, setSettings] = useState({});
  const [logs, setLogs] = useState([]);
  const [igStatus, setIgStatus] = useState(null);
  const [loginData, setLoginData] = useState({ username: '', password: '' });

  const [startRef, startVisible] = useScrollReveal();
  const [howItWorksRef, howItWorksVisible] = useScrollReveal();
  const [aboutRef, aboutVisible] = useScrollReveal();
  const [teamRef, teamVisible] = useScrollReveal();
  const [footerRef, footerVisible] = useScrollReveal(0.1);

  const mountedRef = useRef(true);
  const editorTimerRef = useRef(null);
  const instagramCallbackHandledRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    setIsMounted(true);
    return () => {
      mountedRef.current = false;
      if (editorTimerRef.current) {
        clearTimeout(editorTimerRef.current);
        editorTimerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    const initSession = async () => {
      const token = localStorage.getItem('admin_token');
      if (token) {
        try {
          await api.get('/admin/me');
          if (mountedRef.current) {
            setIsAdminView(true);
          }
        } catch (err) {
          localStorage.removeItem('admin_token');
        }
      }
    };
    initSession();

    const handleUnauthorized = () => {
      setIsAdminView(false);
      setIsLoginView(true);
    };
    window.addEventListener('unauthorized', handleUnauthorized);
    return () => window.removeEventListener('unauthorized', handleUnauthorized);
  }, []);

  useEffect(() => {
    if (showEditor || isSidebarOpen || isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [showEditor, isSidebarOpen, isMenuOpen]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMenuOpen) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMenuOpen]);

  const fetchData = useCallback(async (signal) => {
    if (!isAdminView) return;
    try {
      if (adminTab === 'dashboard') {
        if (mountedRef.current) {
          setDashboardLoading(true);
          setDashboardError('');
        }
        const dashboardResult = await api.get('/admin/dashboard', { signal });
        if (signal?.aborted) return;
        if (mountedRef.current) setDashboardStats(dashboardResult.data);
        try {
          const igRes = await api.get('/admin/instagram/status', { signal });
          if (!signal?.aborted && mountedRef.current) setIgStatus(igRes.data);
        } catch (igError) {
          if (!signal?.aborted && mountedRef.current) setIgStatus({ connected: false });
        }
      } else if (adminTab === 'review') {
        const params = new URLSearchParams(Object.entries(postFilters).filter(([, value]) => value !== '').map(([key, value]) => [key, String(value)]));
        const res = await api.get(`/admin/posts?${params.toString()}`, { signal });
        if (signal?.aborted) return;
        setPosts(res.data.items || []);
        setPostPagination(res.data.pagination || { page: 1, pageSize: 20, total: 0, totalPages: 1 });
      } else if (adminTab === 'settings') {
        const [settingsRes, igRes] = await Promise.all([
          api.get('/admin/settings', { signal }),
          api.get('/admin/instagram/status', { signal })
        ]);
        if (signal?.aborted) return;
        setSettings(settingsRes.data);
        setIgStatus(igRes.data);
      } else if (adminTab === 'logs') {
        const res = await api.get('/admin/logs', { signal });
        if (signal?.aborted) return;
        setLogs(res.data);
      }
    } catch (err) {
      if (signal?.aborted) return;
      if (err.response?.status === 401 || err.response?.status === 403) {
        handleLogout();
      } else if (adminTab === 'dashboard' && mountedRef.current) {
        setDashboardError('無法載入真實投稿統計，請稍後重試。');
      }
    } finally {
      if (adminTab === 'dashboard' && mountedRef.current) setDashboardLoading(false);
    }
  }, [isAdminView, adminTab, postFilters]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    const state = urlParams.get('state');
    if (code && state && isAdminView && !instagramCallbackHandledRef.current) {
      instagramCallbackHandledRef.current = true;
      api.post('/admin/instagram/callback', { code, state }).then(() => {
        window.history.replaceState({}, document.title, window.location.pathname);
        alert("SUCCESS: IG CONNECTED");
        fetchData();
      }).catch(() => {
        alert("ERROR: IG CONNECT FAILED");
        window.history.replaceState({}, document.title, window.location.pathname);
      });
    }
  }, [isAdminView, fetchData]);

  const handleIgConnect = async () => {
    try {
      const res = await api.get('/admin/instagram/auth-url');
      window.location.href = res.data.url;
    } catch (err) {
      alert("ERROR: GET AUTH URL FAILED");
    }
  };

  const handleIgDisconnect = async () => {
    try {
      await api.delete('/admin/instagram/disconnect');
      fetchData();
    } catch (err) {
      alert("ERROR: DISCONNECT FAILED");
    }
  };

  const scrollToSection = (id) => {
    setIsMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleOpenEditor = () => {
    setShowEditor(true);
    setIsPreview(false);
    if (editorTimerRef.current) clearTimeout(editorTimerRef.current);
    editorTimerRef.current = setTimeout(() => {
      editorTimerRef.current = null;
      if (mountedRef.current) setIsEditorAnimating(true);
    }, 10);
  };

  const handleCloseEditor = () => {
    setIsEditorAnimating(false);
    if (editorTimerRef.current) clearTimeout(editorTimerRef.current);
    editorTimerRef.current = setTimeout(() => {
      if (mountedRef.current) {
        setShowEditor(false);
        if (newPost.imagePreview) {
          URL.revokeObjectURL(newPost.imagePreview);
        }
        setNewPost({ title: '天母匿名', content: '', imageFile: null, imagePreview: null });
        setIsPreview(false);
      }
      editorTimerRef.current = null;
    }, 300);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (newPost.imagePreview) {
        URL.revokeObjectURL(newPost.imagePreview);
      }
      setNewPost({ 
        ...newPost, 
        imageFile: file,
        imagePreview: URL.createObjectURL(file) 
      });
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmitPost = async () => {
    if (submittingRef.current || isSubmitting) return;
    if (!newPost.title.trim() || !newPost.content.trim()) {
      alert("請填寫標題與內容！");
      return;
    }

    submittingRef.current = true;
    setIsSubmitting(true);
    const formData = new FormData();
    formData.append('title', newPost.title);
    formData.append('content', newPost.content);
    if (newPost.imageFile) {
      formData.append('image', newPost.imageFile);
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60000);

    try {
      const response = await fetch('/api/posts', {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      if (!response.ok) {
        let errorCode = 'INTERNAL_SERVER_ERROR';
        try {
          const data = await response.json();
          if (data?.error) errorCode = data.error;
        } catch {}
        const error = new Error(errorCode);
        error.status = response.status;
        throw error;
      }

      alert("SUCCESS: 投稿已送出！請等待管理員審核。");
      handleCloseEditor();
    } catch (err) {
      alert(err?.name === 'AbortError' ? "SYSTEM_ERROR: 投稿逾時，請稍後再試。" : ({
        INVALID_IMAGE_TYPE: '圖片格式不支援，請選擇 JPEG、PNG、WebP 或 GIF。',
        INVALID_IMAGE_CONTENT: '圖片檔案無法驗證，請重新選擇有效的圖片。',
        LIMIT_FILE_SIZE: '圖片大小超過限制，請選擇較小的圖片（正式環境上限約 3.5 MB）。',
        PAYLOAD_TOO_LARGE: '投稿資料超過伺服器限制，請選擇較小的圖片。',
        BLOB_UPLOAD_ABORTED: '圖片儲存逾時，請稍後重試。',
        POST_DISABLED: '目前暫停接收投稿，請稍後再試。',
        RATE_LIMITED: '投稿次數過於頻繁，請稍後再試。'
      }[err?.message] || '投稿失敗，請檢查網路或稍後再試。'));
    } finally {
      window.clearTimeout(timeoutId);
      submittingRef.current = false;
      if (mountedRef.current) setIsSubmitting(false);
    }
  };

  const handleAdminLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    try {
      const res = await api.post('/admin/login', loginData);
      localStorage.setItem('admin_token', res.data.token);
      if (mountedRef.current) {
        setIsLoginView(false);
        setIsAdminView(true);
      }
    } catch (err) {
      alert("ACCESS_DENIED: 帳號或密碼錯誤。");
    } finally {
      if (mountedRef.current) setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    setIsAdminView(false);
    setPosts([]);
  };

  const handleStatusChange = async (id, status) => {
    if(!window.confirm(`確定要將狀態更改為 ${status} 嗎？`)) return;
    try {
      await api.put(`/admin/posts/${id}/status`, { status });
      fetchData();
    } catch (err) {
      alert("SYSTEM_ERROR: 更新失敗。");
    }
  };

  const handleSaveEdit = async (post) => {
    try {
      await api.put(`/admin/posts/${post.id}`, {
        title: post.title,
        content: post.content
      });
      fetchData();
    } catch (err) {
      alert("SYSTEM_ERROR: 儲存失敗。");
    }
  };

  const formatIGTitleDate = (value) => {
    const text = String(value || '').trim();
    const match = text.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})[\sT]+(\d{1,2}):(\d{2})(?::(\d{2}))?/);
    if (match) {
      const [, year, month, day, hour, minute, second = '00'] = match;
      return `${year}/${month.padStart(2, '0')}/${day.padStart(2, '0')} ${hour.padStart(2, '0')}:${minute}:${second.padStart(2, '0')}`;
    }

    const parsed = new Date(text);
    if (Number.isNaN(parsed.getTime())) return null;

    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Taipei',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }).formatToParts(parsed).reduce((acc, part) => ({ ...acc, [part.type]: part.value }), {});

    return `${parts.year}/${parts.month}/${parts.day} ${parts.hour === '24' ? '00' : parts.hour}:${parts.minute}:${parts.second}`;
  };

  const handleDownloadIGImage = async (id) => {
    let objectUrl = null;
    try {
      const response = await api.get(`/admin/posts/${id}/instagram-image`, { responseType: 'blob' });
      objectUrl = URL.createObjectURL(response.data);
      const contentType = response.headers['content-type'] || '';
      const extension = contentType.includes('jpeg') ? 'jpg' : contentType.includes('webp') ? 'webp' : contentType.includes('gif') ? 'gif' : 'png';
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `tianmu-post-${id}.${extension}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      alert('圖片下載成功。');
    } catch (err) {
      alert(`圖片下載失敗（${err.response?.data?.error || '請確認投稿已核准'}）。`);
    } finally {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  const handleCopyIGTitle = async (date) => {
    const formattedDate = formatIGTitleDate(date);
    if (!formattedDate) {
      alert('標題複製失敗：投稿日期格式無效。');
      return;
    }

    try {
      await navigator.clipboard.writeText(`天母匿名 ${formattedDate}`);
      alert('標題已複製。');
    } catch (err) {
      alert('標題複製失敗，請確認瀏覽器剪貼簿權限。');
    }
  };

  if (isLoginView) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 bg-[radial-gradient(#cbd5e1_2px,transparent_2px)] [background-size:24px_24px]">
        <div className="bg-white border-[4px] md:border-8 border-black p-6 md:p-8 max-w-md w-full shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] md:shadow-[16px_16px_0px_0px_rgba(37,99,235,1)] animate-[fadeIn_0.4s_ease-out] transform rotate-1">
          <div className="flex justify-center mb-4 md:mb-6">
             <div className="w-12 h-12 md:w-16 md:h-16 bg-blue-600 rounded-full border-[3px] md:border-4 border-black flex items-center justify-center -rotate-6">
                <Lock className="text-white w-6 h-6 md:w-8 md:h-8" />
             </div>
          </div>
          <h2 className="text-2xl md:text-3xl font-black mb-4 md:mb-6 text-center border-b-[3px] md:border-b-4 border-black pb-3 md:pb-4 tracking-widest truncate">
            管理員登入 ★
          </h2>
          <div className="flex flex-col gap-3 md:gap-4">
            <input 
              type="text" placeholder="USERNAME" 
              className="border-[3px] md:border-4 border-black p-3 md:p-4 font-bold focus:outline-none focus:border-blue-600 bg-gray-50 text-sm md:text-base w-full"
              onChange={e => setLoginData({...loginData, username: e.target.value})}
            />
            <input 
              type="password" placeholder="PASSWORD" 
              className="border-[3px] md:border-4 border-black p-3 md:p-4 font-bold focus:outline-none focus:border-blue-600 bg-gray-50 text-sm md:text-base w-full"
              onChange={e => setLoginData({...loginData, password: e.target.value})}
            />
            <div className="flex flex-wrap sm:flex-nowrap gap-3 md:gap-4 mt-4 md:mt-6">
              <button onClick={handleAdminLogin} disabled={isLoggingIn} className="flex-1 min-w-[100px] bg-blue-600 text-white font-black py-3 md:py-4 border-[3px] md:border-4 border-black hover:bg-black transition-colors active:translate-y-1 md:active:translate-y-2 active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed truncate">
                {isLoggingIn ? '登入中...' : '登入'}
              </button>
              <button onClick={() => setIsLoginView(false)} className="flex-1 min-w-[100px] bg-white text-black font-black py-3 md:py-4 border-[3px] md:border-4 border-black hover:bg-gray-100 transition-colors active:translate-y-1 md:active:translate-y-2 active:shadow-none shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-sm md:text-base truncate">返回</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isAdminView) {
    return (
      <div className="min-h-screen flex bg-[#f5f5f5] text-black font-sans selection:bg-blue-600 selection:text-white">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-[78vw] max-w-[280px] lg:w-64 bg-white border-r-[3px] md:border-r-4 border-black flex flex-col transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'} shadow-[4px_0px_0px_0px_rgba(0,0,0,1)] lg:shadow-none overflow-y-auto`}>
          <div className="p-4 md:p-6 border-b-[3px] md:border-b-4 border-black flex items-center justify-between shrink-0">
            <span className="font-black text-xl md:text-2xl tracking-widest flex items-center gap-2 truncate"><Lock size={18} className="text-blue-600 md:w-5 md:h-5 shrink-0" /> 天母匿名</span>
            <button className="lg:hidden shrink-0" onClick={() => setIsSidebarOpen(false)}><X size={20} strokeWidth={3} /></button>
          </div>
          <nav className="flex-grow flex flex-col gap-1.5 md:gap-2 p-3 md:p-4 font-bold text-base md:text-lg">
            <button onClick={() => {setAdminTab('dashboard'); setIsSidebarOpen(false);}} className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 border-[3px] md:border-4 border-transparent hover:border-black transition-all ${adminTab === 'dashboard' ? 'bg-black text-white' : 'hover:bg-blue-50'}`}>
              <LayoutDashboard size={20} className="md:w-6 md:h-6 shrink-0" /> <span className="truncate">主要面板</span>
            </button>
            <div className="relative">
              <button onClick={() => {setAdminTab('review'); setIsSidebarOpen(false);}} className={`w-full flex items-center gap-2 md:gap-3 p-3 md:p-4 border-[3px] md:border-4 border-transparent hover:border-black transition-all ${adminTab === 'review' ? 'bg-black text-white' : 'hover:bg-blue-50'}`}>
                <FileText size={20} className="md:w-6 md:h-6 shrink-0" /> <span className="truncate">投稿審核</span>
              </button>
              {adminTab !== 'review' && (posts || []).filter(p=>p.status==='pending').length > 0 && (
                <div className="absolute top-2 right-2 w-6 h-6 md:w-8 md:h-8 flex items-center justify-center font-black text-white bg-blue-600 rounded-full border-2 border-black transform rotate-12 text-xs md:text-base">
                  {(posts || []).filter(p=>p.status==='pending').length}
                </div>
              )}
            </div>
            <button onClick={() => {setAdminTab('settings'); setIsSidebarOpen(false);}} className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 border-[3px] md:border-4 border-transparent hover:border-black transition-all ${adminTab === 'settings' ? 'bg-black text-white' : 'hover:bg-blue-50'}`}>
              <Settings size={20} className="md:w-6 md:h-6 shrink-0" /> <span className="truncate">網站設定</span>
            </button>
            <button onClick={() => {setAdminTab('logs'); setIsSidebarOpen(false);}} className={`flex items-center gap-2 md:gap-3 p-3 md:p-4 border-[3px] md:border-4 border-transparent hover:border-black transition-all ${adminTab === 'logs' ? 'bg-black text-white' : 'hover:bg-blue-50'}`}>
              <Terminal size={20} className="md:w-6 md:h-6 shrink-0" /> <span className="truncate">Log</span>
            </button>
          </nav>
          <div className="p-3 md:p-4 border-t-[3px] md:border-t-4 border-black font-mono text-xs md:text-sm font-bold text-gray-400 shrink-0 truncate">
            版本 v2.0.26
          </div>
        </aside>
        <div className="flex-1 flex flex-col overflow-hidden relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] min-w-0">
          <header className="h-14 md:h-16 bg-blue-600 text-white border-b-[3px] md:border-b-4 border-black px-4 md:px-8 flex justify-between items-center shrink-0 shadow-[0px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[0px_4px_0px_0px_rgba(0,0,0,1)] z-10">
             <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
               <button className="lg:hidden active:scale-95 transition-transform shrink-0" onClick={() => setIsSidebarOpen(true)}>
                 <Menu size={24} strokeWidth={3} className="md:w-7 md:h-7" />
               </button>
               <span className="font-black tracking-widest flex items-center gap-1.5 md:gap-2 text-sm md:text-base truncate">
                 <Lock size={16} className="md:w-[18px] md:h-[18px] shrink-0" /> 管理員系統 ✦
               </span>
             </div>
             <button onClick={handleLogout} className="flex items-center gap-1.5 md:gap-2 bg-black text-white px-3 py-1.5 md:px-4 md:py-2 font-bold text-xs md:text-base hover:bg-white hover:text-black border-2 border-transparent hover:border-black transition-colors active:translate-y-1 shrink-0">
               <LogOut size={14} className="md:w-4 md:h-4 shrink-0" /> <span className="hidden sm:inline">登出</span>
             </button>
          </header>
          <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
              {adminTab === 'dashboard' && <AdminDashboard stats={dashboardStats} igStatus={igStatus} loading={dashboardLoading} error={dashboardError} onRetry={() => fetchData()} />}
              {adminTab === 'review' && <AdminReview posts={posts} pagination={postPagination} filters={postFilters} setFilters={setPostFilters} handleStatusChange={handleStatusChange} handleSaveEdit={handleSaveEdit} handleDownloadIGImage={handleDownloadIGImage} handleCopyIGTitle={handleCopyIGTitle} />}
              {adminTab === 'settings' && <AdminSettings settings={settings} setSettings={setSettings} igStatus={igStatus} handleIgConnect={handleIgConnect} handleIgDisconnect={handleIgDisconnect} />}
              {adminTab === 'logs' && <AdminLogs logs={logs} />}
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue-600 selection:text-white overflow-x-hidden">
      
      <nav className={`fixed top-0 w-full bg-white border-b-[3px] md:border-b-4 border-black z-50 transition-all duration-700 shadow-sm ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full'}`}>
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-14 md:h-16 flex justify-between items-center">
          <div className="flex items-center gap-2 md:gap-3 cursor-pointer group p-1 border-2 border-transparent hover:border-black transition-all truncate" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="bg-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center group-hover:bg-blue-600 transition-colors transform group-hover:rotate-12 duration-300 shrink-0">
              <img src="/watermarked_img_13241597107139428758.jpg" alt="Logo" className="h-6 md:h-8 w-auto object-contain mix-blend-screen" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
            </div>
            <span className="font-black text-xl md:text-2xl tracking-widest hidden sm:block truncate">天母匿名</span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-bold tracking-wide shrink-0">
            <button onClick={() => scrollToSection('start')} className="hover:text-blue-600 hover:underline decoration-[3px] md:decoration-4 underline-offset-4 transition-all">開始匿名</button>
            <button onClick={() => scrollToSection('how-it-works')} className="hover:text-blue-600 hover:underline decoration-[3px] md:decoration-4 underline-offset-4 transition-all">使用方法</button>
            <button onClick={() => scrollToSection('about')} className="hover:text-blue-600 hover:underline decoration-[3px] md:decoration-4 underline-offset-4 transition-all">關於我們</button>
            <button onClick={() => scrollToSection('team')} className="hover:text-blue-600 hover:underline decoration-[3px] md:decoration-4 underline-offset-4 transition-all">團隊成員</button>
          </div>
          <button 
            className="md:hidden p-1.5 border-[2px] border-black hover:bg-blue-600 hover:text-white transition-colors active:scale-95 shrink-0"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        {isMenuOpen && (
          <div className="md:hidden absolute top-14 left-0 w-full bg-white border-b-[3px] border-black flex flex-col font-bold shadow-[0px_6px_0px_0px_rgba(0,0,0,1)] origin-top">
            <button onClick={() => scrollToSection('start')} className="p-3 border-b-2 border-black hover:bg-blue-600 hover:text-white text-left active:bg-blue-700 text-sm truncate">開始匿名</button>
            <button onClick={() => scrollToSection('how-it-works')} className="p-3 border-b-2 border-black hover:bg-blue-600 hover:text-white text-left active:bg-blue-700 text-sm truncate">使用方法</button>
            <button onClick={() => scrollToSection('about')} className="p-3 border-b-2 border-black hover:bg-blue-600 hover:text-white text-left active:bg-blue-700 text-sm truncate">關於我們</button>
            <button onClick={() => scrollToSection('team')} className="p-3 hover:bg-blue-600 hover:text-white text-left active:bg-blue-700 text-sm truncate">團隊成員</button>
          </div>
        )}
      </nav>

      <section className="pt-24 md:pt-32 pb-16 md:pb-20 px-4 min-h-[85vh] md:min-h-[90vh] flex flex-col justify-center relative overflow-hidden bg-white border-b-[4px] md:border-b-8 border-blue-600 bg-[radial-gradient(#e5e7eb_2px,transparent_2px)] [background-size:24px_24px] bg-fixed">
        
        <div className={`absolute top-20 left-6 md:top-24 md:left-10 text-blue-600 text-3xl md:text-5xl font-black pointer-events-none select-none animate-pulse transition-all duration-1000 delay-500 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>★</div>
        
        <div className={`absolute top-[25%] left-4 md:top-[30%] md:left-[15%] transform -rotate-[12deg] text-xl md:text-4xl font-black pointer-events-none select-none hidden sm:block transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="relative inline-block px-1 md:px-2">
            <span className="relative z-10">#天母匿名</span>
            <div className="absolute inset-0 border-2 border-blue-500 rounded-[50%] transform rotate-2 z-0 scale-110"></div>
          </div>
        </div>

        <div className={`absolute top-1/4 left-1/3 md:left-[35%] w-3 h-3 md:w-4 md:h-4 bg-black pointer-events-none select-none hidden md:block transform rotate-12 transition-all duration-1000 delay-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}></div>

        <div className={`absolute top-1/4 right-8 md:top-1/3 md:right-[30%] bg-blue-600 text-white font-black px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-lg border-2 border-black transform rotate-6 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] pointer-events-none select-none hidden md:block transition-all duration-1000 delay-1000 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-8'}`}>
          NEW!
        </div>

        <a href="https://www.instagram.com/tmjh.new/" target="_blank" rel="noopener noreferrer" className={`absolute bottom-[8%] left-4 md:bottom-[10%] md:left-[15%] transform -rotate-12 hover:scale-110 transition-all cursor-pointer z-20 block duration-1000 delay-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-white p-1.5 md:p-2 border-[3px] md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
            <img src="/tmjh.new_qr.jpg" alt="IG QR Code" className="w-16 h-16 md:w-40 md:h-40 object-contain mix-blend-multiply" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
          </div>
          <div className="absolute -top-2 -left-2 md:-top-3 md:-left-3 w-8 h-3 md:w-12 md:h-4 bg-gray-200 border border-gray-300 transform -rotate-12 opacity-80"></div>
        </a>

        <a href="https://www.instagram.com/tmjh.new/" target="_blank" rel="noopener noreferrer" className={`absolute bottom-16 left-1/3 md:bottom-20 md:left-[45%] transform -rotate-[6deg] text-xl md:text-5xl font-black select-none hidden sm:block z-20 hover:scale-110 hover:text-blue-600 cursor-pointer transition-all duration-1000 delay-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="border-b-[3px] md:border-b-4 border-blue-600 inline-block pb-1"># tmjh.new</span>
        </a>

        <a href="https://www.instagram.com/tmjh.new/" target="_blank" rel="noopener noreferrer" className={`absolute top-[40%] left-6 md:top-[45%] md:left-24 transform rotate-6 text-lg md:text-3xl font-black select-none hidden sm:block z-20 hover:scale-110 hover:text-blue-600 cursor-pointer text-black transition-all duration-1000 delay-500 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          ○ Instagram
        </a>

        <div className={`absolute top-20 right-4 md:top-24 md:right-32 bg-yellow-200 border-2 border-black w-32 md:w-48 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] z-0 pointer-events-none select-none hidden lg:block transform rotate-[+5deg] transition-all duration-1000 delay-700 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>
            <div className="p-2 md:p-3 text-xs md:text-sm font-bold text-black font-mono relative">
              <div className="w-full h-1 bg-yellow-300 absolute top-0 left-0"></div>
              ★ 隨時發布<br/>管理員審核中...
            </div>
        </div>

        <div className={`absolute top-1/3 right-8 md:right-16 w-20 h-20 md:w-48 md:h-48 bg-blue-500 rounded-full pointer-events-none select-none hidden md:block transition-all duration-1000 delay-300 ${isMounted ? 'opacity-20 scale-100' : 'opacity-0 scale-50'}`}></div>

        <a href="https://www.tmjh.tp.edu.tw/nss/p/index" target="_blank" rel="noopener noreferrer" className={`absolute top-[50%] right-4 md:top-[55%] md:right-32 transform rotate-[15deg] select-none hidden sm:block z-20 hover:scale-110 cursor-pointer transition-all duration-1000 delay-700 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <div className="bg-black text-white px-2 py-1 md:px-4 md:py-2 text-lg md:text-4xl font-black border-2 border-black shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] md:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)]">
            天母國中
          </div>
        </a>

        <div className={`absolute bottom-20 right-12 md:bottom-32 md:right-40 text-black text-2xl md:text-4xl font-black pointer-events-none select-none transition-all duration-1000 delay-1000 ${isMounted ? 'opacity-100' : 'opacity-0'}`}>✦</div>

        <div className="max-w-5xl mx-auto w-full relative z-10 text-center flex flex-col items-center mt-6 md:mt-0">
          <h1 className={`text-[3.5rem] sm:text-6xl md:text-[9rem] font-black tracking-tighter mb-3 md:mb-6 text-black leading-none transition-all duration-1000 delay-100 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} break-words w-full`}>
            天母<span className="text-blue-600">匿名</span>
          </h1>
          
          <div className={`inline-block max-w-full bg-black text-white px-4 md:px-10 py-1.5 md:py-3 mb-8 md:mb-10 transform -rotate-2 md:-rotate-1 shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] md:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] transition-all duration-1000 delay-300 ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <p className="text-sm sm:text-base md:text-3xl font-bold tracking-widest truncate">把不敢說的青春，留在這裡 !</p>
          </div>

          <div className={`transition-all duration-1000 delay-500 max-w-full ${isMounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <button 
              onClick={() => scrollToSection('start')}
              className="group relative inline-flex items-center justify-center max-w-full bg-white text-black font-black text-lg md:text-3xl px-6 py-2.5 md:px-10 md:py-4 border-[3px] md:border-8 border-black hover:bg-blue-50 transition-colors shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-y-1 active:translate-y-2 md:active:translate-y-3 active:shadow-none"
            >
              <span className="tracking-widest relative truncate">
                開始匿名
                <svg className="absolute -bottom-1 md:-bottom-2 left-0 w-full h-1.5 md:h-2 text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" viewBox="0 0 100 10" preserveAspectRatio="none">
                  <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                </svg>
              </span>
              <ArrowRight className="w-5 h-5 md:w-8 md:h-8 ml-2 md:ml-4 group-hover:translate-x-1 md:group-hover:translate-x-2 transition-transform shrink-0" strokeWidth={3} />
            </button>
          </div>
        </div>
      </section>

      <section id="start" ref={startRef} className="py-16 md:py-24 bg-blue-600 text-white border-b-[3px] md:border-b-4 border-black relative z-10 overflow-hidden">
        
        <div className={`absolute top-8 left-6 md:top-12 md:left-12 transition-transform duration-700 delay-100 ease-out hidden sm:block ${startVisible ? 'scale-100 rotate-[-8deg] opacity-100' : 'scale-50 rotate-0 opacity-0'}`}>
          <div className="bg-yellow-300 text-black border-[3px] border-black px-4 py-1.5 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-lg">READY? ★</div>
        </div>
        
        <div className={`absolute top-10 right-4 md:top-16 md:right-16 transition-transform duration-700 delay-300 ease-out hidden sm:block ${startVisible ? 'scale-100 rotate-3 opacity-100' : 'scale-50 rotate-12 opacity-0'}`}>
          <div className="bg-white text-black border-[3px] border-black px-3 py-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] font-black text-sm">✎ POST</div>
        </div>

        <div className={`absolute bottom-8 left-4 md:bottom-12 md:left-24 transition-transform duration-700 delay-500 ease-out hidden sm:block ${startVisible ? 'scale-100 rotate-2 opacity-100 translate-y-0' : 'scale-75 rotate-0 opacity-0 translate-y-8'}`}>
          <div className="bg-black text-white px-3 py-1 border-[3px] border-black font-black">放學後投稿</div>
        </div>

        <div className={`absolute bottom-10 right-8 md:bottom-16 md:right-32 transition-transform duration-700 delay-700 ease-out hidden sm:block ${startVisible ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
          <div className="w-10 h-10 border-4 border-black rounded-full flex items-center justify-center font-black text-black rotate-12">○</div>
        </div>

        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-4xl md:text-7xl font-black mb-8 md:mb-16 tracking-widest text-black drop-shadow-[3px_3px_0px_rgba(255,255,255,1)] md:drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] break-words">開始匿名</h2>
          <div className="flex justify-center gap-3 md:gap-12 mb-8 md:mb-12 flex-wrap">
            {[1, 2, 3, 4, 5].map((_, i) => (<ArrowDown key={i} className={`w-8 h-8 md:w-12 md:h-12 text-black transition-all duration-500 ${startVisible ? 'opacity-100 animate-bounce' : 'opacity-0 translate-y-[-20px]'}`} style={{ transitionDelay: `${i * 100}ms`, animationDelay: `${i * 0.1}s` }} strokeWidth={3} />))}
          </div>
          <button onClick={handleOpenEditor} className={`w-full max-w-[280px] md:max-w-none md:w-auto bg-black text-white font-black text-xl md:text-3xl px-8 py-4 md:px-16 md:py-8 border-[3px] md:border-4 border-white hover:bg-white hover:text-black transition-all duration-700 delay-300 shadow-[5px_5px_0px_0px_rgba(255,255,255,1)] md:shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] active:translate-y-1 md:active:translate-y-2 active:shadow-none truncate ${startVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            開始發文 →
          </button>
        </div>
      </section>

      <section id="how-it-works" ref={howItWorksRef} className="py-16 md:py-24 bg-white border-b-[3px] md:border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_95%,#f3f4f6_95%),linear-gradient(90deg,transparent_95%,#f3f4f6_95%)] [background-size:20px_20px]"></div>
        
        <div className="max-w-[90rem] mx-auto px-4 md:px-8 relative z-10">
          <div className={`mb-8 md:mb-16 flex flex-col items-center md:items-start text-center md:text-left transition-all duration-700 ${howItWorksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-wider mb-3 md:mb-4 flex items-center gap-3 md:gap-4 break-words">
              <Star className="w-8 h-8 md:w-10 md:h-10 text-blue-600 hidden md:block fill-blue-600 shrink-0" />
              使用方法
            </h2>
            <p className="text-sm md:text-xl font-bold bg-black text-white px-3 py-1 md:px-4 md:py-1.5 inline-block font-mono border-2 border-black transform -rotate-1 relative max-w-full break-words">
              匿名發文，只需要幾個步驟。
              <span className={`absolute -right-6 -top-4 text-blue-600 font-black text-2xl transition-transform duration-500 delay-700 hidden sm:block ${howItWorksVisible ? 'scale-100 rotate-12' : 'scale-0'}`}>✦</span>
            </p>
          </div>

          <div className="flex flex-col xl:flex-row items-center xl:items-stretch gap-3 md:gap-6 w-full">
            {[
              { num: '01', icon: '★', title: '點擊開始發文', desc: '進入編輯器，開始建立你的投稿。', deco: <PenTool size={16} className="text-black transform rotate-45" /> },
              { num: '02', icon: '✎', title: '編輯貼文', desc: '輸入標題與內容，也可以加入圖片。', deco: <div className="w-8 h-2 bg-yellow-200 border border-yellow-400 rotate-[-10deg]"></div> },
              { num: '03', icon: '→', title: '送出投稿', desc: '確認內容後送出，交給管理員審核。', deco: <Mail size={16} className="text-blue-600" /> },
              { num: '04', icon: '...', title: '等待審核', desc: '投稿送出後，稍微等待一下。', special: 'loading', deco: <Clock size={16} className="text-black" /> },
              { num: '05', icon: '✓', title: '成功發送!!!', desc: '審核通過，進入 IG 發送流程。', special: 'success', deco: <Star size={16} className="fill-blue-600 text-blue-600" /> },
            ].map((step, index, arr) => (
              <React.Fragment key={index}>
                <div className={`flex-1 w-full xl:w-auto bg-white border-[3px] md:border-4 ${step.special === 'success' ? 'border-blue-600 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] md:shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] md:hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)]' : 'border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] md:hover:shadow-[10px_10px_0px_0px_rgba(37,99,235,1)]'} hover:-translate-y-1 md:hover:-translate-y-2 transition-all duration-500 ease-out flex flex-col relative group ${howItWorksVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-20px]'}`} style={{ transitionDelay: `${index * 150}ms` }}>
                  
                  {step.special === 'success' && (
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                      <div className="absolute -top-6 -right-6 md:-top-8 md:-right-8 w-24 h-24 md:w-32 md:h-32 bg-blue-600 rounded-full opacity-10 group-hover:scale-110 transition-transform duration-500"></div>
                    </div>
                  )}

                  <div className={`absolute -top-3 -right-2 md:-top-4 md:-right-4 bg-white border-2 border-black p-1 md:p-1.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] z-20 transform rotate-12 transition-transform duration-500 delay-[${index * 150 + 300}ms] ${howItWorksVisible ? 'scale-100' : 'scale-0'}`}>
                    {step.deco}
                  </div>

                  <div className={`${step.special === 'success' ? 'bg-blue-600 text-white border-blue-600' : 'bg-black text-white border-black'} px-2 py-1.5 md:px-3 md:py-2 flex justify-between items-center border-b-[3px] md:border-b-4 font-bold tracking-wider text-xs md:text-base overflow-hidden`}>
                    <span className="truncate">STEP {step.num} {step.icon}</span>
                    <div className="w-2 h-2 md:w-3 md:h-3 bg-white border-2 border-transparent rounded-full opacity-50 shrink-0 ml-2"></div>
                  </div>

                  <div className={`p-4 md:p-6 flex-grow flex flex-col relative z-10 ${step.special === 'success' ? 'bg-blue-50/80' : ''}`}>
                    <div className={`text-3xl md:text-4xl font-black mb-2 md:mb-4 ${step.special === 'success' ? 'text-blue-600' : 'text-blue-600 group-hover:text-black transition-colors'}`}>
                      {step.num}
                    </div>
                    
                    <h3 className="text-lg md:text-2xl font-black mb-1 md:mb-3 leading-tight break-words">{step.title}</h3>
                    <p className="text-gray-700 font-medium text-xs md:text-sm leading-relaxed mb-2 md:mb-4 break-words">{step.desc}</p>
                    
                    {step.special === 'loading' && (
                      <div className="mt-auto flex gap-1 items-center font-black text-gray-400">
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    )}

                    {step.special === 'success' && (
                      <div className="mt-auto flex flex-col gap-1.5 md:gap-2 font-black text-sm md:text-lg text-blue-600">
                        <span className="inline-block px-1.5 py-0.5 md:px-2 md:py-1 border-2 border-blue-600 bg-white transform -rotate-2 w-max max-w-full truncate shadow-[1.5px_1.5px_0px_0px_rgba(37,99,235,1)] md:shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]">
                          DONE! ★
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {index < arr.length - 1 && (
                  <div className={`flex justify-center items-center py-2 xl:py-0 px-1 shrink-0 transition-all duration-500 ease-out ${howItWorksVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} style={{ transitionDelay: `${index * 150 + 100}ms` }}>
                    <svg className="hidden xl:block w-6 h-6 md:w-8 md:h-8 text-black opacity-50 group-hover:opacity-100 transition-opacity" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                    <svg className="xl:hidden w-6 h-6 md:w-8 md:h-8 text-black opacity-50" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 5v14M19 12l-7 7-7-7"/>
                    </svg>
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      <section id="about" ref={aboutRef} className="py-16 md:py-24 bg-white border-b-[3px] md:border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_95%,#cbd5e1_95%),linear-gradient(90deg,transparent_95%,#cbd5e1_95%)] [background-size:40px_40px]"></div>
        
        <div className={`absolute top-6 right-6 md:top-10 md:right-32 w-24 h-24 md:w-40 md:h-40 border-[3px] md:border-4 border-blue-200 rounded-full opacity-50 pointer-events-none transition-transform duration-1000 ${aboutVisible ? 'scale-100' : 'scale-50'}`}></div>
        <div className={`absolute bottom-12 left-6 md:bottom-20 md:left-20 text-blue-100 opacity-30 pointer-events-none text-7xl md:text-9xl font-serif transition-transform duration-1000 delay-300 ${aboutVisible ? 'translate-y-0' : 'translate-y-8'}`}>"</div>
        
        <div className="max-w-5xl mx-auto px-4 relative z-10">
          <h2 className={`text-3xl md:text-6xl font-black uppercase tracking-wider mb-8 md:mb-12 text-center md:text-left flex justify-center md:justify-start items-center gap-3 md:gap-4 transition-all duration-700 break-words ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="w-6 h-6 md:w-8 md:h-8 bg-blue-600 rounded-full hidden md:block shrink-0"></div>
            關於我們
          </h2>
          
          <div className={`bg-white border-[3px] md:border-4 border-black shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] md:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] p-3 md:p-6 flex flex-col relative md:ml-8 transform rotate-1 hover:rotate-0 transition-all duration-700 delay-200 ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}>
            
            <div className={`absolute -left-4 -top-6 md:-left-8 md:-top-8 transition-transform duration-500 delay-700 z-20 hidden sm:block ${aboutVisible ? 'scale-100 rotate-[-12deg]' : 'scale-0'}`}>
              <div className="bg-yellow-300 text-black px-3 py-1 border-[3px] border-black font-black text-sm shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] truncate">OUR STORY ★</div>
            </div>

            <div className={`absolute right-4 -top-4 md:right-12 md:-top-5 w-16 h-4 bg-gray-200/80 border border-gray-300 transition-transform duration-500 delay-500 z-20 hidden sm:block ${aboutVisible ? 'scale-100 rotate-[15deg]' : 'scale-0'}`}></div>

            <div className="bg-black text-white px-3 py-1.5 md:px-4 md:py-2 flex justify-between items-center font-bold tracking-widest text-sm md:text-base overflow-hidden">
              <span className="truncate">OUR STORY ★</span>
            </div>
            
            <div className="p-4 md:p-10 border-[3px] md:border-4 border-black mt-3 md:mt-4 bg-[#fafafa] relative overflow-hidden">
              <div className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-yellow-300 text-black font-black px-2 py-0.5 md:px-4 md:py-1 border-2 border-black transform rotate-[6deg] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs md:text-base z-10 truncate">
                READ ME
              </div>

              <div className={`absolute bottom-4 right-4 text-blue-600 transition-transform duration-700 delay-[1000ms] hidden sm:block ${aboutVisible ? 'translate-x-0 opacity-100' : 'translate-x-8 opacity-0'}`}>
                <svg viewBox="0 0 100 50" className="w-16 h-8" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round">
                  <path d="M10,25 Q30,10 50,25 T90,25" />
                  <path d="M80,15 L90,25 L80,35" />
                </svg>
              </div>
              
              <div className={`space-y-2 md:space-y-4 text-sm md:text-2xl font-bold leading-normal md:leading-relaxed mt-1 md:mt-2 text-gray-800 transition-all duration-700 delay-400 break-words ${aboutVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <p>我們是天母匿名</p>
                <p>由一個本校生突發奇想建立的</p>
                <p className="text-gray-400">
                  <span className="relative inline-block max-w-full">
                    其實是因為之前的匿名倒了
                    <svg className="absolute top-1/2 left-0 w-full h-3 md:h-4 -mt-1.5 md:-mt-2 text-red-500" preserveAspectRatio="none" viewBox="0 0 100 10">
                      <path d="M0 5 Q 50 8 100 3" stroke="currentColor" strokeWidth="3" fill="none"/>
                    </svg>
                  </span>
                </p>
                <p>然後就拉著我這個<span className="text-white bg-blue-600 px-1.5 md:px-2 transform -rotate-2 inline-block shadow-[1.5px_1.5px_0px_0px_rgba(0,0,0,1)] md:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] relative z-10">2版主</span>一起建立了這個網站</p>
                
                <div className="pt-4 md:pt-8">
                  <p className="text-lg md:text-3xl font-black mb-2 md:mb-4 flex items-center gap-1.5 md:gap-2 break-words">
                    歡迎大家來匿名發帖! <span className="text-blue-600 shrink-0">✦</span>
                  </p>
                  <p className="inline-block max-w-full bg-white text-black px-3 py-1.5 md:px-4 md:py-2 border-[3px] md:border-4 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-1 text-xs md:text-base relative z-10 break-words">
                    但是不要發一些太超過的內容喔!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="team" ref={teamRef} className="py-16 md:py-24 bg-white border-b-[3px] md:border-b-4 border-black relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(transparent_95%,#f3f4f6_95%)] [background-size:100%_32px]"></div>
        
        <div className="max-w-6xl mx-auto px-4 relative z-10">
          <div className={`mb-4 md:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-3 md:gap-4 border-b-[3px] md:border-b-4 border-black pb-3 md:pb-4 transition-all duration-700 ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <h2 className="text-3xl md:text-6xl font-black uppercase tracking-wider text-black break-words">團隊成員</h2>
            <span className="font-bold text-sm md:text-xl bg-white px-2 py-0.5 md:px-3 md:py-1 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transform rotate-2 w-max max-w-full truncate">
              TEAM
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 pt-12 md:pt-20">
            
            <div className={`relative mt-6 md:mt-0 transition-all duration-700 ease-out transform ${teamVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[-40px]'}`}>
              
              <div className={`absolute -top-6 left-10 md:-top-8 md:left-12 z-20 transition-transform duration-500 delay-500 hidden sm:block ${teamVisible ? 'scale-100' : 'scale-0'}`}>
                 <div className="w-4 h-12 bg-gray-300 border-2 border-gray-400 rounded-full shadow-sm transform -rotate-12"></div>
                 <div className="w-4 h-12 bg-gray-300 border-2 border-gray-400 rounded-full shadow-sm transform rotate-12 absolute top-0 -left-1 opacity-50 mix-blend-multiply"></div>
              </div>

              <div className={`absolute -top-16 left-0 md:-top-28 md:-left-8 z-20 flex flex-col items-center transition-all duration-700 delay-[600ms] max-w-[80%] ${teamVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                <div className="bg-black text-white px-2 py-1 md:px-4 md:py-2 font-black text-sm md:text-lg transform rotate-[-8deg] shadow-[3px_3px_0px_0px_rgba(37,99,235,1)] md:shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] truncate w-full text-center">
                  在這也要匿名
                </div>
                <svg viewBox="0 0 100 100" className={`w-8 h-10 md:w-10 md:h-12 text-black mt-1 md:mt-2 transform rotate-12 shrink-0 ${teamVisible ? 'animate-pulse' : ''}`} fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" style={{ overflow: 'visible' }}>
                  <path d="M 40 0 C 80 20, 90 60, 50 60 C 20 60, 20 20, 60 30 C 90 40, 50 70, 40 95" />
                  <path d="M 20 75 L 40 95 L 65 80" />
                </svg>
              </div>

              <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(0,0,0,1)] md:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] md:hover:shadow-[12px_12px_0px_0px_rgba(37,99,235,1)] transition-all flex flex-col h-full relative z-10 group min-w-0">
                
                <div className="bg-black text-white p-2 md:p-3 border-b-[3px] md:border-b-4 border-black flex justify-between items-center font-bold text-xs md:text-base overflow-hidden">
                  <span className="tracking-widest flex items-center gap-2 truncate"><Star size={14} className="fill-white shrink-0"/> <span className="truncate">MEMBER 01</span></span>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-white rounded-full opacity-50 shrink-0 ml-2"></div>
                </div>
                
                <div className="p-4 md:p-8 flex-grow flex flex-col relative bg-white min-w-0">
                  <div className="absolute top-4 right-4 md:top-6 md:right-6 text-blue-600 opacity-20 group-hover:opacity-100 transition-opacity">
                    <svg width="40" height="40" viewBox="0 0 100 100" className="md:w-[60px] md:h-[60px]">
                      <path d="M 50 10 C 20 10 10 40 10 60 C 10 80 40 90 60 90 C 80 90 90 60 90 40 C 90 20 60 10 50 10" fill="none" stroke="currentColor" strokeWidth="4" strokeDasharray="300" strokeDashoffset="0" className="animate-[dash_2s_ease-out_forwards]" />
                    </svg>
                  </div>
                  
                  <div className="mb-6 md:mb-8 relative z-10">
                    <div className="text-xs md:text-sm font-black text-gray-500 mb-1 truncate">身份：版主</div>
                    <h3 className="text-[2rem] md:text-5xl font-black mb-1 md:mb-2 flex items-center gap-2 break-words">
                       匿名 <span className="text-xl text-yellow-400 hidden sm:block shrink-0">★</span>
                    </h3>
                    <div className="inline-block max-w-full bg-blue-100 text-blue-800 font-bold px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-sm border-[3px] md:border-2 border-blue-800 transform -rotate-1 truncate">
                      天母匿名版主
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3 font-bold text-sm md:text-xl mb-6 md:mb-10 flex-grow text-gray-800 break-words">
                    <p>目前還在校就讀</p>
                    <p>如有任何問題或建議</p>
                    <p>私訊以下電郵</p>
                  </div>

                  <div className="mt-auto bg-gray-50 border-[3px] md:border-4 border-black p-3 md:p-5 border-dashed relative">
                    <div className={`absolute -top-3 -right-3 w-8 h-8 bg-blue-600 rounded-full border-2 border-black z-20 transition-transform duration-500 delay-[800ms] hidden sm:block ${teamVisible ? 'scale-100' : 'scale-0'}`}></div>
                    <div className="text-[10px] md:text-sm font-black text-gray-500 mb-0.5 md:mb-1 truncate">E-mail：</div>
                    <a href="mailto:tmjh.new@gmail.com" className="text-base md:text-xl font-black text-blue-600 hover:text-black transition-colors break-all relative inline-block group/link">
                      tmjh.new@gmail.com
                      <span className="absolute -bottom-1 left-0 w-0 h-1 bg-black transition-all group-hover/link:w-full"></span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div className={`transition-all duration-700 ease-out delay-200 transform ${teamVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-[40px]'}`}>
              <div className="bg-white border-[3px] md:border-4 border-black shadow-[5px_5px_0px_0px_rgba(37,99,235,1)] md:shadow-[8px_8px_0px_0px_rgba(37,99,235,1)] hover:-translate-y-1 md:hover:-translate-y-2 hover:shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] md:hover:shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] transition-all flex flex-col h-full md:mt-12 relative z-10 min-w-0">
                
                <div className={`absolute -top-4 right-10 md:-top-5 md:right-16 z-20 transition-transform duration-500 delay-700 hidden sm:block ${teamVisible ? 'scale-100 rotate-6' : 'scale-0 rotate-0'}`}>
                   <div className="bg-yellow-300 border-2 border-black px-2 py-1 text-xs font-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] truncate">✦ 2版主</div>
                </div>

                <div className="bg-blue-600 text-white p-2 md:p-3 border-b-[3px] md:border-b-4 border-black flex justify-between items-center font-bold text-xs md:text-base overflow-hidden">
                  <span className="tracking-widest truncate">MEMBER 02</span>
                  <div className="w-2 h-2 md:w-3 md:h-3 bg-white opacity-50 transform rotate-45 shrink-0 ml-2"></div>
                </div>
                
                <div className="p-4 md:p-8 flex-grow flex flex-col relative bg-white min-w-0">
                  <div className="absolute top-6 right-6 md:top-8 md:right-8 text-black opacity-30 text-xl md:text-2xl font-black transform rotate-12">+</div>
                  
                  <div className="mb-6 md:mb-8">
                    <div className="text-xs md:text-sm font-black text-gray-500 mb-1 truncate">身份：2版主</div>
                    <h3 className="text-[2rem] md:text-5xl font-black mb-1 md:mb-2 tracking-tight break-words">都可以 doukeyi_tw</h3>
                    <div className="inline-block max-w-full bg-black text-white font-bold px-2 py-0.5 md:px-3 md:py-1 text-xs md:text-sm border-[3px] md:border-2 border-black transform rotate-1 truncate">
                      天母匿名2版主
                    </div>
                  </div>

                  <div className="space-y-2 md:space-y-3 font-bold text-sm md:text-xl mb-6 md:mb-10 flex-grow text-gray-800 break-words">
                    <p>非本校生</p>
                    <p>目前擔任黑奴</p>
                    <p>負責:網站維護 投稿審核</p>
                    <p className="text-blue-600">有事找1版主～</p>
                  </div>

                  <div className="mt-auto bg-blue-50 border-[3px] md:border-4 border-blue-600 p-3 md:p-5 relative">
                    <div className={`absolute -top-2 right-3 md:-top-3 md:right-4 w-6 h-3 md:w-10 md:h-4 bg-yellow-200/80 transform rotate-6 transition-transform duration-500 delay-[900ms] ${teamVisible ? 'scale-100' : 'scale-0'}`}></div>
                    <div className="text-[10px] md:text-sm font-black text-blue-800 mb-0.5 md:mb-1 truncate">E-mail ↴</div>
                    <a href="mailto:dou206890@gmail.com" className="text-base md:text-xl font-black text-black hover:text-blue-600 transition-colors break-all relative inline-block group/link">
                      dou206890@gmail.com
                      <span className="absolute -bottom-1 left-0 w-0 h-1 bg-blue-600 transition-all group-hover/link:w-full"></span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <footer ref={footerRef} className="bg-black text-white py-8 md:py-12 border-t-[4px] md:border-t-8 border-blue-600 relative overflow-hidden">
        
        <div className={`absolute top-4 right-10 md:top-8 md:right-20 text-yellow-400 font-black text-lg md:text-xl transform rotate-12 transition-all duration-700 hidden sm:block ${footerVisible ? 'scale-100 opacity-100' : 'scale-50 opacity-0'}`}>
          SEE YOU AFTER SCHOOL ★
        </div>
        
        <div className={`absolute bottom-4 left-10 text-white/10 font-black text-4xl transform -rotate-6 transition-all duration-1000 delay-300 pointer-events-none select-none hidden md:block ${footerVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
          ✎
        </div>

        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4 md:gap-6 relative z-10 overflow-hidden">
          <div className="flex items-center gap-3 md:gap-4 group cursor-pointer overflow-hidden" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
             <img src="/watermarked_img_13241597107139428758.jpg" alt="Logo" className="h-8 md:h-10 w-auto invert transition-transform group-hover:scale-110 shrink-0" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
             <div className="overflow-hidden">
               <h4 className="text-xl md:text-2xl font-black tracking-widest group-hover:text-blue-400 transition-colors truncate">天母匿名</h4>
               <p className="font-mono text-xs md:text-sm text-gray-400 mt-0.5 md:mt-1 truncate">ANONYMOUS COMMUNITY</p>
             </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-2 md:gap-3 text-xs md:text-sm font-bold text-gray-400 w-full md:w-auto">
            <div className="flex flex-wrap justify-center md:justify-end gap-4 md:gap-6 mb-1">
              <a href="mailto:tmjh.new@gmail.com" className="flex items-center gap-1.5 md:gap-2 hover:text-blue-400 transition-colors cursor-pointer text-white">
                <span className="font-mono break-all">tmjh.new@gmail.com</span>
              </a>
              <a href="https://www.instagram.com/tmjh.new/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 md:gap-2 hover:text-blue-400 transition-colors cursor-pointer text-white">
                <Instagram size={16} className="md:w-[18px] md:h-[18px] shrink-0" />
                <span className="font-mono truncate">@tmjh.new</span>
              </a>
            </div>
            
            <p className="text-center md:text-right w-full">© 2026 天母匿名. All rights reserved.</p>
            <button onClick={() => {
              const token = localStorage.getItem('admin_token');
              if (token) {
                setIsLoginView(false);
                setIsAdminView(true);
              } else {
                setIsLoginView(true);
                setIsAdminView(false);
              }
            }} className="text-gray-600 hover:text-white transition-colors cursor-pointer font-mono text-[10px] md:text-xs mt-1 truncate max-w-full">
              ADMIN.LOGIN
            </button>
          </div>
        </div>
      </footer>

      {showEditor && (
        <div className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex justify-center items-center p-2 md:p-4 transition-opacity duration-300 ${isEditorAnimating ? 'opacity-100' : 'opacity-0'}`}>
          <div className={`bg-white w-full max-w-4xl mx-4 border-[3px] md:border-4 border-black shadow-[6px_6px_0px_0px_rgba(37,99,235,1)] md:shadow-[16px_16px_0px_0px_rgba(37,99,235,1)] flex flex-col max-h-[85vh] md:max-h-[95vh] transition-all duration-300 transform ${isEditorAnimating ? 'scale-100 translate-y-0' : 'scale-95 translate-y-4'}`}>
            <div className="bg-black text-white p-2 md:p-3 flex justify-between items-center text-sm md:text-base shrink-0">
              <div className="flex items-center gap-2 md:gap-3 font-bold tracking-widest truncate">
                <span className="text-blue-400 shrink-0">★</span>
                <span className="truncate">{isPreview ? '預覽貼文' : '新增匿名投稿'}</span>
              </div>
              <button onClick={handleCloseEditor} className="hover:bg-red-500 hover:text-white px-2 md:px-3 font-black transition-colors active:scale-95 text-lg md:text-base leading-none pb-1 shrink-0">x</button>
            </div>
            
            <div className="p-3 md:p-8 overflow-y-auto flex-grow flex flex-col gap-4 md:gap-6 bg-[linear-gradient(transparent_95%,#f3f4f6_95%)] [background-size:100%_32px]">
              {isPreview ? (
                <div className="flex flex-col items-center py-2 md:py-4 animate-[fadeIn_0.3s_ease-out]">
                  <PostCardRenderer title={newPost.title} content={newPost.content} image={newPost.imagePreview} />
                </div>
              ) : (
                <div className="animate-[fadeIn_0.3s_ease-out] flex flex-col gap-4 md:gap-6 h-full min-h-0">
                  <div className="shrink-0">
                    <label className="block text-base md:text-xl font-black mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2 truncate">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-blue-600 shrink-0"></div>貼文標題
                    </label>
                    <input type="text" value={newPost.title} onChange={(e) => setNewPost({...newPost, title: e.target.value})} placeholder="天母匿名" className="w-full border-[3px] md:border-4 border-black p-2 md:p-4 font-bold text-base md:text-lg focus:outline-none focus:border-blue-600 transition-colors bg-white/90" />
                  </div>
                  <div className="flex-grow flex flex-col relative min-h-0">
                    <label className="block text-base md:text-xl font-black mb-1 md:mb-2 flex items-center gap-1.5 md:gap-2 truncate shrink-0">
                      <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-black shrink-0"></div>想說的話 <span className="text-red-500">*</span>
                    </label>
                    <textarea 
                      maxLength={200}
                      value={newPost.content} 
                      onChange={(e) => setNewPost({...newPost, content: e.target.value})} 
                      placeholder={"想要談論八卦?!還是說說心裡話...(最多200字)\n字體設定：\n# 大標題\n-# 小字\n**粗體**\n*斜體*\n__底線__\n~~刪除線~~"} 
                      className="w-full flex-grow min-h-[160px] md:min-h-[250px] border-[3px] md:border-4 border-black p-2 md:p-4 font-bold text-sm md:text-lg resize-none focus:outline-none focus:border-blue-600 transition-colors bg-white/90 leading-relaxed"
                    ></textarea>
                    <div className={`absolute bottom-3 right-3 md:bottom-4 md:right-4 font-bold text-xs md:text-sm bg-white border-2 border-black px-1.5 py-0.5 md:px-2 md:py-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${newPost.content.length >= 200 ? 'text-red-600' : 'text-black'}`}>
                      {newPost.content.length} / 200
                    </div>
                  </div>
                  {newPost.imagePreview && (
                    <div className="relative w-20 h-20 md:w-32 md:h-32 border-[3px] md:border-4 border-black bg-white p-1 transform rotate-2 shrink-0">
                      <img src={newPost.imagePreview} alt="Upload preview" className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                      <button onClick={() => {
                        if (newPost.imagePreview) URL.revokeObjectURL(newPost.imagePreview);
                        setNewPost({...newPost, imageFile: null, imagePreview: null});
                      }} className="absolute -top-3 -right-3 md:-top-4 md:-right-4 bg-red-500 text-white w-6 h-6 md:w-8 md:h-8 flex items-center justify-center border-2 border-black font-black hover:scale-110 active:scale-95 transition-transform shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] text-xs md:text-base">X</button>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row justify-between items-center gap-2 md:gap-4 bg-white border-t-[3px] md:border-t-4 border-black p-3 md:p-4 shrink-0">
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" ref={fileInputRef} onChange={handleImageUpload} className="hidden" />
              {!isPreview && (
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-1.5 md:gap-2 bg-white border-[3px] md:border-4 border-black px-3 py-1.5 md:px-4 md:py-2 font-black text-sm md:text-base hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] w-full sm:w-auto justify-center">
                  <ImageIcon size={16} className="md:w-5 md:h-5 shrink-0" /><span className="truncate">{newPost.imagePreview ? '更換圖片' : '上傳圖片 (最多 1 張)'}</span>
                </button>
              )}
              {isPreview && <div className="hidden sm:block"></div>}
              <div className="flex flex-wrap sm:flex-nowrap gap-2 md:gap-4 w-full sm:w-auto">
                <button onClick={() => setIsPreview(!isPreview)} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 bg-white border-[3px] md:border-4 border-black px-3 py-2 md:px-6 md:py-2 font-black text-sm md:text-base hover:bg-gray-100 active:translate-y-1 active:shadow-none transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] min-w-[120px]">
                  {isPreview ? <Edit2 size={16} className="md:w-5 md:h-5 shrink-0" /> : <Eye size={16} className="md:w-5 md:h-5 shrink-0" />}<span className="truncate">{isPreview ? '繼續編輯' : '預覽'}</span>
                </button>
                <button onClick={handleSubmitPost} disabled={isSubmitting} className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 md:gap-2 bg-blue-600 text-white border-[3px] md:border-4 border-black px-3 py-2 md:px-6 md:py-2 font-black text-sm md:text-base hover:bg-blue-700 active:translate-y-1 active:shadow-none transition-all shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]">
                  <Send size={16} className="md:w-5 md:h-5 shrink-0" /><span className="truncate">{isSubmitting ? '送出中...' : '送出投稿'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TianmuAnonymous;

