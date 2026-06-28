'use client';

import React, { useState, useEffect } from 'react';
import { Plus, X, Upload, Wand2, Volume2, Trash2 } from 'lucide-react';
import { useWordStore, Word } from '../../stores/wordStore';

interface WordFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  categoryId: string;
  languageCode: string;
  word?: Word | null;
}

export default function WordFormModal({ isOpen, onClose, categoryId, languageCode, word }: WordFormModalProps) {
  const { createWord, updateWord, lookupDictionary } = useWordStore();
  const [text, setText] = useState('');
  const [ipa, setIpa] = useState('');
  const [audioUrl, setAudioUrl] = useState('');
  const [note, setNote] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState('');
  
  const [meanings, setMeanings] = useState([{ typeOfWord: 'Noun', meaningText: '' }]);
  const [examples, setExamples] = useState([{ sentence: '' }]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (word) {
      setText(word.text);
      setIpa(word.ipa || '');
      setAudioUrl(word.audioUrl || '');
      setNote(word.note || '');
      setImageUrl(word.imageUrl || '');
      setImageFile(null);
      
      if (word.meanings && word.meanings.length > 0) {
        setMeanings(word.meanings.map(m => ({ typeOfWord: m.typeOfWord, meaningText: m.meaningText })));
      } else {
        setMeanings([{ typeOfWord: 'Noun', meaningText: '' }]);
      }
      
      if (word.examples && word.examples.length > 0) {
        setExamples(word.examples.map(e => ({ sentence: e.sentence })));
      } else {
        setExamples([{ sentence: '' }]);
      }
    } else {
      resetForm();
    }
  }, [word, isOpen]);

  const resetForm = () => {
    setText('');
    setIpa('');
    setAudioUrl('');
    setNote('');
    setImageFile(null);
    setImageUrl('');
    setMeanings([{ typeOfWord: 'Noun', meaningText: '' }]);
    setExamples([{ sentence: '' }]);
    setError('');
  };

  const handleLookup = async () => {
    if (!text.trim()) return;
    
    setIsLookingUp(true);
    try {
      const result = await lookupDictionary(text, languageCode);
      if (result) {
        if (result.phonetic && !ipa) setIpa(result.phonetic);
        if (result.audioUrl && !audioUrl) setAudioUrl(result.audioUrl);
      }
    } catch (e) {
      // Ignore lookup errors
    } finally {
      setIsLookingUp(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('Word text is required');
      return;
    }
    
    const validMeanings = meanings.filter(m => m.meaningText.trim());
    if (validMeanings.length === 0) {
      setError('At least one meaning is required');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('Text', text);
      if (ipa) formData.append('IPA', ipa);
      if (audioUrl) formData.append('AudioUrl', audioUrl);
      if (note) formData.append('Note', note);
      
      if (imageFile) {
        formData.append('ImageFile', imageFile);
      }

      // Filter out empty strings and serialize
      formData.append('MeaningsJson', JSON.stringify(validMeanings));
      
      const validExamples = examples.filter(e => e.sentence.trim());
      formData.append('ExamplesJson', JSON.stringify(validExamples));

      if (word) {
        await updateWord(word.id, formData);
      } else {
        await createWord(categoryId, formData);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save word');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black bg-opacity-50 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-white dark:bg-gray-800 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            {word ? 'Edit Word' : 'Add New Word'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="overflow-y-auto p-6 flex-1">
          {error && (
            <div className="mb-4 p-4 text-sm text-red-700 bg-red-100 rounded-xl dark:bg-red-900/30 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="col-span-2 md:col-span-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Word *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={text}
                      onChange={(e) => setText(e.target.value)}
                      className="flex-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="e.g., Apple"
                      required
                    />
                    <button
                      type="button"
                      onClick={handleLookup}
                      disabled={!text || isLookingUp}
                      className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 disabled:opacity-50"
                      title="Auto-fetch IPA & Audio"
                    >
                      <Wand2 className={`h-5 w-5 ${isLookingUp ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    IPA (Phonetics)
                  </label>
                  <input
                    type="text"
                    value={ipa}
                    onChange={(e) => setIpa(e.target.value)}
                    className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 font-mono"
                    placeholder="e.g., /ˈæp.əl/"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Audio URL
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="url"
                      value={audioUrl}
                      onChange={(e) => setAudioUrl(e.target.value)}
                      className="flex-1 w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="https://..."
                    />
                    {audioUrl && (
                      <button
                        type="button"
                        onClick={() => new Audio(audioUrl).play().catch(() => {})}
                        className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300"
                        title="Play Audio"
                      >
                        <Volume2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              <div className="col-span-2 md:col-span-1 flex flex-col">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Image
                </label>
                <div className="flex-1 flex justify-center items-center rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 p-6 text-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 relative overflow-hidden"
                     onClick={() => document.getElementById('imageUpload')?.click()}>
                  {imageFile ? (
                    <img src={URL.createObjectURL(imageFile)} alt="Preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : imageUrl ? (
                    <img src={process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') + imageUrl} alt="Current" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="space-y-2">
                      <Upload className="mx-auto h-8 w-8 text-gray-400" />
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Click to upload image
                      </div>
                    </div>
                  )}
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files?.[0]) setImageFile(e.target.files[0]);
                    }}
                  />
                </div>
                {(imageFile || imageUrl) && (
                  <button type="button" onClick={(e) => { e.stopPropagation(); setImageFile(null); setImageUrl(''); }} className="mt-2 text-sm text-red-500 hover:text-red-700">
                    Remove Image
                  </button>
                )}
              </div>
            </div>

            {/* Meanings */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-medium text-gray-900 dark:text-white">
                  Meanings *
                </label>
                <button
                  type="button"
                  onClick={() => setMeanings([...meanings, { typeOfWord: 'Noun', meaningText: '' }])}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Meaning
                </button>
              </div>
              
              <div className="space-y-3">
                {meanings.map((meaning, index) => (
                  <div key={index} className="flex space-x-3 items-start">
                    <select
                      value={meaning.typeOfWord}
                      onChange={(e) => {
                        const newMeanings = [...meanings];
                        newMeanings[index].typeOfWord = e.target.value;
                        setMeanings(newMeanings);
                      }}
                      className="w-32 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="Noun">Noun</option>
                      <option value="Verb">Verb</option>
                      <option value="Adjective">Adjective</option>
                      <option value="Adverb">Adverb</option>
                      <option value="Pronoun">Pronoun</option>
                      <option value="Preposition">Preposition</option>
                      <option value="Conjunction">Conjunction</option>
                      <option value="Interjection">Interjection</option>
                      <option value="Phrase">Phrase</option>
                    </select>
                    <input
                      type="text"
                      value={meaning.meaningText}
                      onChange={(e) => {
                        const newMeanings = [...meanings];
                        newMeanings[index].meaningText = e.target.value;
                        setMeanings(newMeanings);
                      }}
                      className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Enter meaning..."
                      required
                    />
                    {meanings.length > 1 && (
                      <button
                        type="button"
                        onClick={() => setMeanings(meanings.filter((_, i) => i !== index))}
                        className="p-2.5 text-gray-400 hover:text-red-500"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Examples */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <div className="flex justify-between items-center mb-4">
                <label className="block text-lg font-medium text-gray-900 dark:text-white">
                  Examples
                </label>
                <button
                  type="button"
                  onClick={() => setExamples([...examples, { sentence: '' }])}
                  className="flex items-center text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 font-medium"
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Example
                </button>
              </div>
              
              <div className="space-y-3">
                {examples.map((example, index) => (
                  <div key={index} className="flex space-x-3 items-start">
                    <input
                      type="text"
                      value={example.sentence}
                      onChange={(e) => {
                        const newExamples = [...examples];
                        newExamples[index].sentence = e.target.value;
                        setExamples(newExamples);
                      }}
                      className="flex-1 rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                      placeholder="Example sentence..."
                    />
                    <button
                      type="button"
                      onClick={() => setExamples(examples.filter((_, i) => i !== index))}
                      className="p-2.5 text-gray-400 hover:text-red-500"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Personal Notes (Optional)
              </label>
              <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2.5 text-gray-900 dark:text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                placeholder="Memory hooks, grammar rules, etc."
              />
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 dark:border-gray-700 p-6 flex justify-end space-x-3 bg-gray-50 dark:bg-gray-800/50">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center shadow-lg shadow-indigo-600/20"
          >
            {isSubmitting ? 'Saving...' : 'Save Word'}
          </button>
        </div>
      </div>
    </div>
  );
}
