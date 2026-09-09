import { describe, expect, it } from 'vitest';
import { hasTopicFidelity, topicKeywords } from '../shared/topicFidelity';

describe('topic fidelity', () => {
  it('keeps meaningful keywords and singularizes simple plurals', () => {
    expect(topicKeywords('The Cathars and the Albigensian Crusade')).toEqual([
      'cathar', 'albigensian', 'crusade'
    ]);
  });

  it('accepts a dossier containing multiple topic signals', () => {
    expect(hasTopicFidelity('The Cathars and the Albigensian Crusade', {
      title: 'Cathar history during the Albigensian Crusade'
    })).toBe(true);
  });

  it('rejects a valid dossier about a different topic', () => {
    expect(hasTopicFidelity('The archaeology of Cahokia mounds', {
      title: 'Charismatic communities and collective effervescence',
      claims: ['Durkheim and love bombing']
    })).toBe(false);
  });

  it('does not let the model pass by echoing the requested topic in metadata', () => {
    expect(hasTopicFidelity('The archaeology of Cahokia mounds', {
      meta: { researchTopic: 'The archaeology of Cahokia mounds' },
      title: 'Charismatic communities and collective effervescence'
    })).toBe(false);
  });
});
