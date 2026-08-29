import React, { useState, useEffect } from 'react';
import {
  Sliders,
  TrendingUp,
  DollarSign,
  UserCheck,
  Award,
  Sparkles,
  RotateCcw,
  Info,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { aiIntelligenceService } from '../../services/aiIntelligenceService.js';

export function WhatIfSimulator() {
  const defaultBaselines = {
    adSpend: 1845000,
    leadVolume: 4820,
    conversionRate: 28.4,
    averageDealValue: 9370,
    followUpCompletionRate: 78.5,
  };

  const [inputs, setInputs] = useState(defaultBaselines);
  const [simulation, setSimulation] = useState(null);

  useEffect(() => {
    runSimulation(inputs);
  }, [inputs]);

  const runSimulation = async (simInputs) => {
    const res = await aiIntelligenceService.simulateScenario(simInputs);
    setSimulation(res);
  };

  const handleInputChange = (field, val) => {
    setInputs((prev) => ({
      ...prev,
      [field]: parseFloat(val) || 0,
    }));
  };

  const applyPreset = (presetType) => {
    switch (presetType) {
      case 'spend_20':
        setInputs({
          ...defaultBaselines,
          adSpend: Math.round(defaultBaselines.adSpend * 1.2),
          leadVolume: Math.round(defaultBaselines.leadVolume * 1.2),
        });
        break;
      case 'conv_15':
        setInputs({
          ...defaultBaselines,
          conversionRate: parseFloat((defaultBaselines.conversionRate * 1.15).toFixed(1)),
        });
        break;
      case 'followup_20':
        setInputs({
          ...defaultBaselines,
          followUpCompletionRate: Math.min(100, parseFloat((defaultBaselines.followUpCompletionRate * 1.2).toFixed(1))),
        });
        break;
      case 'deal_10':
        setInputs({
          ...defaultBaselines,
          averageDealValue: Math.round(defaultBaselines.averageDealValue * 1.1),
        });
        break;
      case 'reset':
      default:
        setInputs(defaultBaselines);
        break;
    }
  };

  const isPositiveGrowth = (simulation?.revenueDifference || 0) >= 0;

  return (
    <div className="whatif-simulator-card">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="simulator-icon-badge">
            <Sliders size={17} className="text-purple" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Interactive What-If Growth Scenario Simulator
            </h3>
            <p className="text-xs text-muted">
              Simulate the revenue, ROAS, and customer acquisition impact of budget adjustments, conversion optimizations, and SLA improvements
            </p>
          </div>
        </div>

        {/* Preset Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            className="btn-preset-chip"
            onClick={() => applyPreset('spend_20')}
          >
            +20% Ad Spend
          </button>
          <button
            type="button"
            className="btn-preset-chip"
            onClick={() => applyPreset('conv_15')}
          >
            +15% Conversion
          </button>
          <button
            type="button"
            className="btn-preset-chip"
            onClick={() => applyPreset('followup_20')}
          >
            +20% Follow-up SLA
          </button>
          <button
            type="button"
            className="btn-preset-chip"
            onClick={() => applyPreset('deal_10')}
          >
            +10% Deal Value
          </button>
          <button
            type="button"
            className="btn-preset-chip reset"
            onClick={() => applyPreset('reset')}
            title="Reset to Actual Agency Baselines"
          >
            <RotateCcw size={11} />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Simulator Layout: Inputs (Left 5 cols) vs Projected Outcomes (Right 7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Input Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-3.5 bg-slate-900/40 p-4 rounded-xl border border-white/5">
          <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-2">
            Simulated Operational Inputs
          </h4>

          {/* 1. Ad Spend */}
          <div className="simulator-slider-box">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-semibold">Monthly Media Spend:</span>
              <strong className="text-white font-bold">₹{inputs.adSpend.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min="500000"
              max="5000000"
              step="50000"
              value={inputs.adSpend}
              onChange={(e) => handleInputChange('adSpend', e.target.value)}
              className="w-full accent-cyan"
            />
          </div>

          {/* 2. Lead Volume */}
          <div className="simulator-slider-box">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-semibold">Monthly Lead Volume:</span>
              <strong className="text-cyan font-bold">{inputs.leadVolume.toLocaleString()} Leads</strong>
            </div>
            <input
              type="range"
              min="1000"
              max="15000"
              step="100"
              value={inputs.leadVolume}
              onChange={(e) => handleInputChange('leadVolume', e.target.value)}
              className="w-full accent-cyan"
            />
          </div>

          {/* 3. Conversion Rate */}
          <div className="simulator-slider-box">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-semibold">Lead-to-Won Conversion:</span>
              <strong className="text-success font-bold">{inputs.conversionRate}%</strong>
            </div>
            <input
              type="range"
              min="5"
              max="60"
              step="0.5"
              value={inputs.conversionRate}
              onChange={(e) => handleInputChange('conversionRate', e.target.value)}
              className="w-full accent-success"
            />
          </div>

          {/* 4. Average Deal Value */}
          <div className="simulator-slider-box">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-semibold">Average Deal Ticket:</span>
              <strong className="text-warning font-bold">₹{inputs.averageDealValue.toLocaleString()}</strong>
            </div>
            <input
              type="range"
              min="2000"
              max="50000"
              step="500"
              value={inputs.averageDealValue}
              onChange={(e) => handleInputChange('averageDealValue', e.target.value)}
              className="w-full accent-warning"
            />
          </div>

          {/* 5. Follow-up SLA */}
          <div className="simulator-slider-box">
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300 font-semibold">Follow-Up Completion %:</span>
              <strong className="text-purple font-bold">{inputs.followUpCompletionRate}%</strong>
            </div>
            <input
              type="range"
              min="40"
              max="100"
              step="1"
              value={inputs.followUpCompletionRate}
              onChange={(e) => handleInputChange('followUpCompletionRate', e.target.value)}
              className="w-full accent-purple"
            />
          </div>
        </div>

        {/* Right: Projected Calculated Outcomes (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between">
          <div>
            <h4 className="text-xs font-bold text-dim uppercase tracking-wider mb-3">
              Simulated Financial &amp; Conversion Outcomes
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
              {/* Projected Revenue */}
              <div className="sim-outcome-box highlight">
                <span className="sim-outcome-lbl">Projected Revenue</span>
                <strong className="sim-outcome-val text-warning">
                  ₹{(simulation?.projectedRevenue || 0).toLocaleString()}
                </strong>
                <span className="sim-outcome-sub">Monthly gross GMV</span>
              </div>

              {/* Revenue Difference */}
              <div className="sim-outcome-box">
                <span className="sim-outcome-lbl">Revenue Delta</span>
                <strong
                  className={`sim-outcome-val ${
                    isPositiveGrowth ? 'text-success' : 'text-danger'
                  }`}
                >
                  {isPositiveGrowth ? '+' : ''}₹{(simulation?.revenueDifference || 0).toLocaleString()}
                </strong>
                <span className="sim-outcome-sub">vs ₹12.84M baseline</span>
              </div>

              {/* Projected Growth % */}
              <div className="sim-outcome-box">
                <span className="sim-outcome-lbl">Estimated Growth</span>
                <strong
                  className={`sim-outcome-val ${
                    isPositiveGrowth ? 'text-success' : 'text-danger'
                  }`}
                >
                  {simulation?.estimatedGrowthPct}
                </strong>
                <span className="sim-outcome-sub">Topline trajectory</span>
              </div>

              {/* Projected ROAS */}
              <div className="sim-outcome-box">
                <span className="sim-outcome-lbl">Projected ROAS</span>
                <strong className="sim-outcome-val text-success">
                  {simulation?.projectedROAS}
                </strong>
                <span className="sim-outcome-sub">Media spend return</span>
              </div>

              {/* Projected Wins */}
              <div className="sim-outcome-box">
                <span className="sim-outcome-lbl">Closed Deals</span>
                <strong className="sim-outcome-val text-purple">
                  {(simulation?.projectedWins || 0).toLocaleString()} Wins
                </strong>
                <span className="sim-outcome-sub">From {simulation?.projectedQualifiedLeads} qualified</span>
              </div>

              {/* Projected Leads */}
              <div className="sim-outcome-box">
                <span className="sim-outcome-lbl">Inbound Leads</span>
                <strong className="sim-outcome-val text-cyan">
                  {(simulation?.projectedLeads || 0).toLocaleString()}
                </strong>
                <span className="sim-outcome-sub">Total captured pipeline</span>
              </div>
            </div>
          </div>

          {/* Simulation Disclaimer */}
          <div className="forecast-disclaimer-box flex items-center gap-2">
            <Info size={13} className="text-dim flex-shrink-0" />
            <span className="text-[11px] text-dim">
              Scenario Simulation — Not a live forecast. Calculations are mathematical projections based on selected hypothetical operational parameters.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WhatIfSimulator;
