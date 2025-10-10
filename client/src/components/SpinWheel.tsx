import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import Loader from "@/components/Loader";

type Eligible = { studentId: string; name: string };

export default function SpinWheel() {
  const [eligible, setEligible] = useState<Eligible[]>([]);
  const [history, setHistory] = useState<Array<{ studentId: string; name: string; date: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [spinning, setSpinning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wheelRef = useRef<HTMLDivElement>(null);
  const [pendingWinner, setPendingWinner] = useState<Eligible | null>(null);
  const [showWinner, setShowWinner] = useState(false);
  const formatName = (s: string) => {
    const t = String(s || '').trim().toLowerCase();
    return t ? t.charAt(0).toUpperCase() + t.slice(1) : '';
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eRes, hRes] = await Promise.all([
        fetch('/api/spin/eligible', { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } }),
        fetch('/api/spin/history', { headers: { 'x-admin-id': localStorage.getItem('userId') || '' } }),
      ]);
      const eJson = await eRes.json();
      const hJson = await hRes.json();
      if (!eRes.ok) throw new Error(eJson?.message || 'Failed to load eligible');
      if (!hRes.ok) throw new Error(hJson?.message || 'Failed to load history');
      setEligible(Array.isArray(eJson?.eligible) ? eJson.eligible : []);
      setHistory(Array.isArray(hJson) ? hJson : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const colors = useMemo(() => [
    '#6366F1','#22C55E','#F59E0B','#EC4899','#06B6D4','#F97316','#84CC16','#A855F7'
  ], []);

  const onSpin = async () => {
    if (eligible.length === 0 || spinning) return;
    setError(null);
    setSpinning(true);
    try {
      // Request server to select a winner and persist
      const res = await fetch('/api/spin', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' } });
      const j = await res.json();
      if (!res.ok) throw new Error(j?.message || 'Failed to spin');
      const winner: Eligible = j?.winner;
      if (!winner) throw new Error('No winner returned');
      setPendingWinner(winner);

      // Animate wheel to the winner index
      const idx = eligible.findIndex(s => s.studentId === winner.studentId);
      const segmentAngle = 360 / Math.max(eligible.length, 1);
      const baseTurns = 10; // more full spins for longer duration
      const targetAngle = baseTurns * 360 + (eligible.length - idx - 0.5) * segmentAngle;
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'transform 7s cubic-bezier(0.22, 1, 0.36, 1)';
        wheelRef.current.style.transform = `rotate(${targetAngle}deg)`;
      }
      // Wait for animation to finish then refresh lists
      setTimeout(async () => {
        setShowWinner(true);
        await fetchData();
        setSpinning(false);
      }, 7100);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to spin');
      setSpinning(false);
    }
  };

  const onReset = async () => {
    if (!confirm('Reset all spins for this admin?')) return;
    try {
      const res = await fetch('/api/spin', { method: 'DELETE', headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
      if (!res.ok) throw new Error('Failed to reset');
      if (wheelRef.current) {
        wheelRef.current.style.transition = 'none';
        wheelRef.current.style.transform = 'rotate(0deg)';
      }
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to reset');
    }
  };

  const [editOpen, setEditOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});
  const toggleSel = (sid: string) => setSelectedIds(prev => ({ ...prev, [sid]: !prev[sid] }));
  const clearSel = () => setSelectedIds({});

  const applyExclusions = async (mode: 'exclude' | 'include') => {
    const ids = Object.keys(selectedIds).filter(k => selectedIds[k]);
    if (ids.length === 0) return;
    try {
      const body = mode === 'exclude' ? { excludeIds: ids } : { includeIds: ids };
      const res = await fetch('/api/spin/exclusions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-id': localStorage.getItem('userId') || '' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error('Failed to update');
      clearSel();
      await fetchData();
      setEditOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update');
    }
  };

  const removeFromHistory = async (studentId: string) => {
    try {
      const res = await fetch(`/api/spin/history/${encodeURIComponent(studentId)}`, { method: 'DELETE', headers: { 'x-admin-id': localStorage.getItem('userId') || '' } });
      if (!res.ok) throw new Error('Failed to remove');
      await fetchData();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to remove');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">Spin students once each. Winners are excluded automatically.</div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData} disabled={spinning}>Refresh</Button>
          <Button variant="destructive" onClick={onReset} disabled={spinning}>Reset</Button>
          <Button variant="outline" onClick={() => { setEditOpen(true); clearSel(); }}>Edit Spin List</Button>
        </div>
      </div>
      {error && <div className="text-sm text-destructive" role="alert">{error}</div>}
      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader /></div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <div className="flex flex-col items-center">
            <div className="relative" style={{ width: 320, height: 320 }}>
              <div ref={wheelRef} className="absolute inset-0 rounded-full border" style={{ transform: 'rotate(0deg)' }}>
                {eligible.length === 0 ? (
                  <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">No eligible students</div>
                ) : eligible.map((s, i) => {
                  const seg = 360 / eligible.length;
                  const rotate = i * seg;
                  return (
                    <div key={s.studentId} className="absolute top-1/2 left-1/2 origin-left text-xs" style={{ transform: `rotate(${rotate}deg) translateX(8px)` }}>
                      <div className="px-2 py-1 rounded" style={{ background: colors[i % colors.length], color: 'white' }}>{s.name}</div>
                    </div>
                  );
                })}
              </div>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-0 h-0 border-l-8 border-r-8 border-b-[14px] border-l-transparent border-r-transparent border-b-primary" />
            </div>
            <div className="mt-4">
              <Button onClick={onSpin} disabled={spinning || eligible.length === 0}>{spinning ? 'Spinning…' : 'Spin'}</Button>
            </div>
          </div>
          <div>
            <div className="text-sm text-muted-foreground mb-2">History</div>
            <div className="border rounded divide-y max-h-[320px] overflow-auto">
              {history.map((h) => (
                <div key={`${h.studentId}-${h.date}`} className="p-2 text-sm flex items-center justify-between">
                  <div className="truncate pr-2">
                    <div className="font-medium">{h.name}</div>
                    <div className="text-xs text-muted-foreground font-mono">{h.studentId}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="text-xs text-muted-foreground">{new Date(h.date).toLocaleString()}</div>
                    <Button size="sm" variant="outline" onClick={() => removeFromHistory(h.studentId)}>Remove</Button>
                  </div>
                </div>
              ))}
              {history.length === 0 && (
                <div className="p-3 text-sm text-muted-foreground">No spins yet.</div>
              )}
            </div>
          </div>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Spin List</DialogTitle>
            <DialogDescription>
              Select students, then choose Exclude to keep them out of spins, or Include to re-add them.
            </DialogDescription>
          </DialogHeader>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-[50vh] overflow-auto">
            {[...eligible, ...history.map(h => ({ studentId: h.studentId, name: h.name }))].reduce((acc: Eligible[], cur) => {
              if (!acc.find(a => a.studentId === cur.studentId)) acc.push(cur); return acc;
            }, []).map(s => (
              <label key={s.studentId} className="flex items-center gap-2 text-sm border rounded px-2 py-1">
                <input type="checkbox" checked={!!selectedIds[s.studentId]} onChange={() => toggleSel(s.studentId)} />
                <span className="truncate" title={s.name}>{s.name}</span>
                <span className="ml-auto text-xs font-mono text-muted-foreground">{s.studentId}</span>
              </label>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditOpen(false); clearSel(); }}>Close</Button>
            <Button variant="outline" onClick={() => applyExclusions('include')}>Include</Button>
            <Button variant="destructive" onClick={() => applyExclusions('exclude')}>Exclude</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showWinner} onOpenChange={setShowWinner}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Congratulations!</DialogTitle>
            <DialogDescription>Winner selected</DialogDescription>
          </DialogHeader>
          <div className="relative h-32 overflow-hidden rounded bg-accent/30 border flex items-center justify-center">
            {pendingWinner && (
              <div className="absolute z-10 flex flex-col items-center">
                <div className="px-4 py-2 rounded-full text-white text-xl font-semibold shadow-md"
                     style={{ background: 'linear-gradient(90deg,#6366F1,#A855F7)' }}>
                  {formatName(pendingWinner.name)}
                </div>
                <div className="mt-2 text-xs font-mono text-muted-foreground bg-background/60 px-2 py-1 rounded">
                  {pendingWinner.studentId}
                </div>
              </div>
            )}
            {[...Array(40)].map((_, i) => (
              <span
                key={i}
                className="absolute block w-2 h-2 rounded-full"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `-${Math.random() * 40 + 10}px`,
                  background: ['#ef4444','#22c55e','#3b82f6','#f59e0b','#a855f7','#06b6d4'][i % 6],
                  transform: `translateY(0)` ,
                  animation: `confettiFall ${3 + Math.random() * 2}s linear ${Math.random()}s forwards`
                }}
              />
            ))}
          </div>
          <style>{`@keyframes confettiFall { to { transform: translateY(160px) rotate(360deg); opacity: 0.6; } }`}</style>
          <DialogFooter>
            <Button onClick={() => setShowWinner(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


