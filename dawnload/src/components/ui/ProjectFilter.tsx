import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Filter, X } from 'lucide-react';
import { DAWType, Genre, MusicalKey } from '../../types';

export function ProjectFilter() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [isBpmPanelOpen, setIsBpmPanelOpen] = useState(false);
  const [isKeyPanelOpen, setIsKeyPanelOpen] = useState(false);
  const [isGenrePanelOpen, setIsGenrePanelOpen] = useState(false);
  const [isDawPanelOpen, setIsDawPanelOpen] = useState(false);
  const [isPricePanelOpen, setIsPricePanelOpen] = useState(false);
  const [bpmMode, setBpmMode] = useState<'range' | 'exact'>('range');
  const [keyMode, setKeyMode] = useState<'flat' | 'sharp'>('flat');
  const [selectedKey, setSelectedKey] = useState<string>('');
  const [selectedMode, setSelectedMode] = useState<'Major' | 'Minor' | ''>('');
  
  const bpmPanelRef = useRef<HTMLDivElement>(null);
  const keyPanelRef = useRef<HTMLDivElement>(null);
  const genrePanelRef = useRef<HTMLDivElement>(null);
  const dawPanelRef = useRef<HTMLDivElement>(null);
  const pricePanelRef = useRef<HTMLDivElement>(null);
  
  const [selectedDaws, setSelectedDaws] = useState<Set<DAWType>>(new Set());
  const [selectedGenres, setSelectedGenres] = useState<Set<Genre>>(new Set());
  const [key, setKey] = useState<MusicalKey | ''>('');
  const [bpmRange, setBpmRange] = useState<{ min: number; max: number }>({ min: 0, max: 300 });
  const [exactBpm, setExactBpm] = useState<number>(120);
  const [priceRange, setPriceRange] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bpmPanelRef.current && !bpmPanelRef.current.contains(event.target as Node)) {
        setIsBpmPanelOpen(false);
      }
      if (keyPanelRef.current && !keyPanelRef.current.contains(event.target as Node)) {
        setIsKeyPanelOpen(false);
      }
      if (genrePanelRef.current && !genrePanelRef.current.contains(event.target as Node)) {
        setIsGenrePanelOpen(false);
      }
      if (dawPanelRef.current && !dawPanelRef.current.contains(event.target as Node)) {
        setIsDawPanelOpen(false);
      }
      if (pricePanelRef.current && !pricePanelRef.current.contains(event.target as Node)) {
        setIsPricePanelOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  useEffect(() => {
    const dawParam = searchParams.get('dawType');
    const genreParam = searchParams.get('genre');
    
    if (dawParam) {
      setSelectedDaws(new Set([dawParam as DAWType]));
    }
    if (genreParam) {
      setSelectedGenres(new Set([genreParam as Genre]));
    }
    const keyParam = searchParams.get('key');
    const bpmParam = searchParams.get('bpm');
    const bpmMinParam = searchParams.get('bpmMin');
    const bpmMaxParam = searchParams.get('bpmMax');
    const priceParam = searchParams.get('price');
    
    if (keyParam) setKey(keyParam as MusicalKey);
    if (bpmParam) {
      setExactBpm(parseInt(bpmParam));
      setBpmMode('exact');
    }
    if (bpmMinParam && bpmMaxParam) {
      setBpmRange({ min: parseInt(bpmMinParam), max: parseInt(bpmMaxParam) });
      setBpmMode('range');
    }
    if (priceParam === 'free') setPriceRange('free');
    if (priceParam === 'paid') setPriceRange('paid');
  }, [searchParams]);

  const applyFilters = () => {
    const newParams = new URLSearchParams(searchParams);
    
    if (selectedDaws.size > 0) {
      newParams.set('dawType', Array.from(selectedDaws).join(','));
    } else {
      newParams.delete('dawType');
    }
    
    if (selectedGenres.size > 0) {
      newParams.set('genre', Array.from(selectedGenres).join(','));
    } else {
      newParams.delete('genre');
    }
    
    if (key) {
      newParams.set('key', key);
    } else {
      newParams.delete('key');
    }
    
    if (bpmMode === 'exact') {
      newParams.set('bpm', exactBpm.toString());
      newParams.delete('bpmMin');
      newParams.delete('bpmMax');
    } else {
      if (bpmRange.min > 0) {
        newParams.set('bpmMin', bpmRange.min.toString());
      } else {
        newParams.delete('bpmMin');
      }
      
      if (bpmRange.max < 300) {
        newParams.set('bpmMax', bpmRange.max.toString());
      } else {
        newParams.delete('bpmMax');
      }
      newParams.delete('bpm');
    }
    
    if (priceRange !== 'all') {
      newParams.set('price', priceRange);
    } else {
      newParams.delete('price');
    }
    
    setSearchParams(newParams);
    setIsOpen(false);
  };
  
  const resetFilters = () => {
    setSelectedDaws(new Set());
    setSelectedGenres(new Set());
    setKey('');
    setBpmRange({ min: 0, max: 300 });
    setExactBpm(120);
    setPriceRange('all');
    setSearchParams({});
    setIsOpen(false);
  };
  
  const dawOptions: DAWType[] = [
    'Logic Pro',
    'FL Studio',
    'Ableton Live',
    'Cubase',
    'Pro Tools',
    'Studio One',
    'Bitwig Studio',
    'Reason',
    'Reaper',
    'GarageBand',
  ];
  
  const genreOptions: Genre[] = [
    'Hip-Hop',
    'Electronic',
    'Pop',
    'Rock',
    'R&B',
    'EDM',
    'Trap',
    'House',
    'Techno',
    'Ambient',
    'Jazz',
    'Classical',
    'Folk',
    'World',
    'Other',
  ];

  const keyOptions: MusicalKey[] = [
    'C', 'C#/Db', 'D', 'D#/Eb', 'E', 'F', 'F#/Gb', 'G', 'G#/Ab', 'A', 'A#/Bb', 'B',
    'Am', 'A#m/Bbm', 'Bm', 'Cm', 'C#m/Dbm', 'Dm', 'D#m/Ebm', 'Em', 'Fm', 'F#m/Gbm', 'Gm', 'G#m/Abm'
  ];

  const majorKeys = keyOptions.filter(k => !k.includes('m'));
  const minorKeys = keyOptions.filter(k => k.includes('m'));
  
  const toggleFilter = () => {
    setIsOpen(!isOpen);
  };

  const toggleBpmPanel = () => {
    setIsBpmPanelOpen(!isBpmPanelOpen);
    setIsKeyPanelOpen(false);
  };

  const handleBpmModeChange = (e: React.MouseEvent, mode: 'range' | 'exact') => {
    e.stopPropagation();
    setBpmMode(mode);
  };

  const toggleKeyPanel = () => {
    setIsKeyPanelOpen(!isKeyPanelOpen);
    setIsBpmPanelOpen(false);
  };

  const getBpmDisplayValue = () => {
    if (bpmMode === 'exact') {
      return `${exactBpm} BPM`;
    }
    if (bpmRange.min > 0 || bpmRange.max < 300) {
      return `${bpmRange.min}-${bpmRange.max} BPM`;
    }
    return 'BPM';
  };
  
  const hasActiveFilters = selectedDaws.size > 0 || selectedGenres.size > 0 || key || bpmRange.min > 0 || bpmRange.max < 300 || exactBpm !== 120 || priceRange !== 'all';
  
  return (
    <div className="mb-8">
      <div className="flex gap-2 mb-4">
        <div className="relative">
          <button 
            onClick={() => {
              setIsBpmPanelOpen(!isBpmPanelOpen);
              setIsKeyPanelOpen(false);
            }}
            className="btn-secondary"
          >
            {getBpmDisplayValue()}
          </button>
          {isBpmPanelOpen && (
            <div 
              ref={bpmPanelRef}
              className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={(e) => handleBpmModeChange(e, 'range')}
                    className={`text-sm font-medium pb-2 border-b-2 ${
                      bpmMode === 'range'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-black'
                    }`}
                  >
                    Range
                  </button>
                  <button
                    onClick={(e) => handleBpmModeChange(e, 'exact')}
                    className={`text-sm font-medium pb-2 border-b-2 ${
                      bpmMode === 'exact'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-black'
                    }`}
                  >
                    Exact
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setBpmRange({ min: 0, max: 300 });
                    setExactBpm(120);
                  }} 
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Reset
                </button>
              </div>

              {bpmMode === 'range' ? (
                <div className="space-y-4">
                  <div className="relative pt-6">
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={bpmRange.min}
                      onChange={(e) => setBpmRange(prev => ({ ...prev, min: parseInt(e.target.value) }))}
                      className="absolute top-0 left-0 w-full h-1 bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={bpmRange.max}
                      onChange={(e) => setBpmRange(prev => ({ ...prev, max: parseInt(e.target.value) }))}
                      className="absolute top-0 left-0 w-full h-1 bg-transparent rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-between">
                    <input
                      type="number"
                      value={bpmRange.min}
                      onChange={(e) => setBpmRange(prev => ({ ...prev, min: parseInt(e.target.value) || 0 }))}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md"
                      placeholder="Min"
                    />
                    <input
                      type="number"
                      value={bpmRange.max}
                      onChange={(e) => setBpmRange(prev => ({ ...prev, max: parseInt(e.target.value) || 300 }))}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md"
                      placeholder="Max"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="relative pt-6">
                    <input
                      type="range"
                      min="0"
                      max="300"
                      value={exactBpm}
                      onChange={(e) => setExactBpm(parseInt(e.target.value))}
                      className="w-full h-1 bg-gray-200 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer"
                    />
                  </div>
                  <div className="flex justify-center">
                    <input
                      type="number"
                      value={exactBpm}
                      onChange={(e) => setExactBpm(parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 text-center border border-gray-300 rounded-md"
                      placeholder="BPM"
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setIsKeyPanelOpen(!isKeyPanelOpen);
              setIsBpmPanelOpen(false);
            }}
            className="btn-secondary"
          >
            {key || 'Key'}
          </button>
          {isKeyPanelOpen && (
            <div 
              ref={keyPanelRef}
              className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <div className="flex gap-4">
                  <button
                    onClick={(e) => setKeyMode('flat')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      keyMode === 'flat'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-black'
                    }`}
                  >
                    Flat keys
                  </button>
                  <button
                    onClick={(e) => setKeyMode('sharp')}
                    className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
                      keyMode === 'sharp'
                        ? 'border-black text-black'
                        : 'border-transparent text-gray-500 hover:text-black'
                    }`}
                  >
                    Sharp keys
                  </button>
                </div>
                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedKey('');
                    setSelectedMode('');
                    setKey('');
                  }} 
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear
                </button>
              </div>

              <div className="grid grid-cols-4 gap-2 mb-4">
                <button
                  onClick={() => {
                    const newKey = keyMode === 'flat' ? 'Db' : 'C#';
                    setSelectedKey(selectedKey === newKey ? '' : newKey);
                    setKey(selectedKey === newKey ? selectedMode : `${newKey}${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === (keyMode === 'flat' ? 'Db' : 'C#') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {keyMode === 'flat' ? 'Db' : 'C#'}
                </button>
                <button
                  onClick={() => {
                    const newKey = keyMode === 'flat' ? 'Eb' : 'D#';
                    setSelectedKey(selectedKey === newKey ? '' : newKey);
                    setKey(selectedKey === newKey ? selectedMode : `${newKey}${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === (keyMode === 'flat' ? 'Eb' : 'D#') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {keyMode === 'flat' ? 'Eb' : 'D#'}
                </button>
                <button
                  onClick={() => {
                    const newKey = keyMode === 'flat' ? 'Gb' : 'F#';
                    setSelectedKey(selectedKey === newKey ? '' : newKey);
                    setKey(selectedKey === newKey ? selectedMode : `${newKey}${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === (keyMode === 'flat' ? 'Gb' : 'F#') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {keyMode === 'flat' ? 'Gb' : 'F#'}
                </button>
                <button
                  onClick={() => {
                    const newKey = keyMode === 'flat' ? 'Ab' : 'G#';
                    setSelectedKey(selectedKey === newKey ? '' : newKey);
                    setKey(selectedKey === newKey ? selectedMode : `${newKey}${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === (keyMode === 'flat' ? 'Ab' : 'G#') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {keyMode === 'flat' ? 'Ab' : 'G#'}
                </button>
                <button
                  onClick={() => {
                    const newKey = keyMode === 'flat' ? 'Bb' : 'A#';
                    setSelectedKey(selectedKey === newKey ? '' : newKey);
                    setKey(selectedKey === newKey ? selectedMode : `${newKey}${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === (keyMode === 'flat' ? 'Bb' : 'A#') ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  {keyMode === 'flat' ? 'Bb' : 'A#'}
                </button>
              </div>

              <div className="grid grid-cols-7 gap-2 mb-4">
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'C' ? '' : 'C');
                    setKey(selectedKey === 'C' ? selectedMode : `C${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'C' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  C
                </button>
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'D' ? '' : 'D');
                    setKey(selectedKey === 'D' ? selectedMode : `D${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'D' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  D
                </button>
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'E' ? '' : 'E');
                    setKey(selectedKey === 'E' ? selectedMode : `E${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'E' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  E
                </button>
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'F' ? '' : 'F');
                    setKey(selectedKey === 'F' ? selectedMode : `F${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'F' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  F
                </button>
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'G' ? '' : 'G');
                    setKey(selectedKey === 'G' ? selectedMode : `G${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'G' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  G
                </button>
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'A' ? '' : 'A');
                    setKey(selectedKey === 'A' ? selectedMode : `A${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'A' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  A
                </button>
                <button
                  onClick={() => {
                    setSelectedKey(selectedKey === 'B' ? '' : 'B');
                    setKey(selectedKey === 'B' ? selectedMode : `B${selectedMode}`);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedKey === 'B' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  B
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    const newMode = selectedMode === 'Major' ? '' : 'Major';
                    setSelectedMode(newMode);
                    setKey(selectedKey + newMode);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedMode === 'Major' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Major
                </button>
                <button
                  onClick={() => {
                    const newMode = selectedMode === 'Minor' ? '' : 'Minor';
                    setSelectedMode(newMode);
                    setKey(selectedKey + newMode);
                  }}
                  className={`px-3 py-2 text-sm rounded-md ${
                    selectedMode === 'Minor' ? 'bg-black text-white' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  Minor
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setIsGenrePanelOpen(!isGenrePanelOpen);
              setIsBpmPanelOpen(false);
              setIsKeyPanelOpen(false);
              setIsDawPanelOpen(false);
            }}
            className="btn-secondary"
          >
            {selectedGenres.size > 0 ? `${selectedGenres.size} Genre${selectedGenres.size > 1 ? 's' : ''}` : 'Genre'}
          </button>
          {isGenrePanelOpen && (
            <div 
              ref={genrePanelRef}
              className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Genres</h3>
                <button 
                  onClick={() => setSelectedGenres(new Set())}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {genreOptions.map((genre) => (
                  <label key={genre} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedGenres.has(genre)}
                      onChange={() => {
                        const newGenres = new Set(selectedGenres);
                        if (newGenres.has(genre)) {
                          newGenres.delete(genre);
                        } else {
                          newGenres.add(genre);
                        }
                        setSelectedGenres(newGenres);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black checked:bg-black checked:hover:bg-black checked:focus:bg-black"
                    />
                    <span className="text-sm">{genre}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setIsDawPanelOpen(!isDawPanelOpen);
              setIsBpmPanelOpen(false);
              setIsKeyPanelOpen(false);
              setIsGenrePanelOpen(false);
            }}
            className="btn-secondary"
          >
            {selectedDaws.size > 0 ? `${selectedDaws.size} DAW${selectedDaws.size > 1 ? 's' : ''}` : 'DAW'}
          </button>
          {isDawPanelOpen && (
            <div 
              ref={dawPanelRef}
              className="absolute top-full left-0 mt-2 w-[300px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">DAWs</h3>
                <button 
                  onClick={() => setSelectedDaws(new Set())}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                {dawOptions.map((daw) => (
                  <label key={daw} className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                    <input
                      type="checkbox"
                      checked={selectedDaws.has(daw)}
                      onChange={() => {
                        const newDaws = new Set(selectedDaws);
                        if (newDaws.has(daw)) {
                          newDaws.delete(daw);
                        } else {
                          newDaws.add(daw);
                        }
                        setSelectedDaws(newDaws);
                      }}
                      className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black checked:bg-black checked:hover:bg-black checked:focus:bg-black"
                    />
                    <span className="text-sm">{daw}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="relative">
          <button 
            onClick={() => {
              setIsPricePanelOpen(!isPricePanelOpen);
              setIsBpmPanelOpen(false);
              setIsKeyPanelOpen(false);
              setIsGenrePanelOpen(false);
              setIsDawPanelOpen(false);
            }}
            className="btn-secondary"
          >
            {priceRange === 'all' ? 'Price' : priceRange === 'free' ? 'Free' : 'Paid'}
          </button>
          {isPricePanelOpen && (
            <div 
              ref={pricePanelRef}
              className="absolute top-full left-0 mt-2 w-[200px] bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-medium">Price Range</h3>
                <button 
                  onClick={() => setPriceRange('all')}
                  className="text-sm text-gray-500 hover:text-black"
                >
                  Clear
                </button>
              </div>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                  <input
                    type="radio"
                    checked={priceRange === 'all'}
                    onChange={() => setPriceRange('all')}
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black checked:bg-black checked:hover:bg-black checked:focus:bg-black"
                  />
                  <span className="text-sm">All Prices</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                  <input
                    type="radio"
                    checked={priceRange === 'free'}
                    onChange={() => setPriceRange('free')}
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black checked:bg-black checked:hover:bg-black checked:focus:bg-black"
                  />
                  <span className="text-sm">Free Only</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer p-2 hover:bg-gray-50 rounded-md">
                  <input
                    type="radio"
                    checked={priceRange === 'paid'}
                    onChange={() => setPriceRange('paid')}
                    className="h-4 w-4 border-gray-300 text-black focus:ring-black checked:bg-black checked:hover:bg-black checked:focus:bg-black"
                  />
                  <span className="text-sm">Paid Only</span>
                </label>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}