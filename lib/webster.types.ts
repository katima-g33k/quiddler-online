/**
 * Known functional labels (parts of speech) returned by the Merriam-Webster Dictionary API.
 */
export type KnownFunctionalLabel =
	// Traditional Parts of Speech
	| "noun"
	| "verb"
	| "transitive verb"
	| "intransitive verb"
	| "adjective"
	| "adverb"
	| "pronoun"
	| "preposition"
	| "conjunction"
	| "interjection"

	// Special & Non-Traditional Classifications
	| "verbal auxiliary"
	| "verbal imperative"
	| "verb impersonal"
	| "prefix"
	| "suffix"
	| "combining form"
	| "abbreviation"
	| "symbol"
	| "trademark"
	| "certification mark"
	| "biographical name"
	| "geographical name";

/**
 * Merriam-Webster API `fl` field type.
 * Uses `(Record<never, never> & string)` to retain IDE autocompletion for known options
 * while permitting arbitrary strings (e.g., "adjective or adverb") or an undefined field.
 */
export type FunctionalLabel =
	| KnownFunctionalLabel
	| (string & Record<never, never>);

type WebsterMeta = {
	id: string;
	uuid: string;
	sort: string;
	src: string;
	section: string;
	stems: string[];
	offensive: boolean;
};

type WebsterSound = {
	audio: string;
	ref: string;
	stat: string;
};

type WebsterPronunciation = {
	mw: string;
	sound?: WebsterSound;
};

type WebsterHeadwordInfo = {
	hw: string;
	prs?: WebsterPronunciation[];
};

type WebsterInflection = {
	il?: string;
	ifc?: string;
	if: string;
};

type WebsterAuthorQuote = {
	auth?: string;
	source?: string;
};

type WebsterVerbalIllustration = {
	t: string;
	aq?: WebsterAuthorQuote;
};

type WebsterCategory = {
	cat: string;
};

type WebsterCalledAlso = {
	intro: string;
	cats: WebsterCategory[];
};

type WebsterDefiningTextItem =
	| ["text", string]
	| ["vis", WebsterVerbalIllustration[]]
	| ["uns", WebsterDefiningTextItem[][]]
	| ["ca", WebsterCalledAlso];

type WebsterSense = {
	sn?: string;
	dt: WebsterDefiningTextItem[];
};

type WebsterSenseSequenceItem =
	| ["sense", WebsterSense]
	| ["pseq", WebsterSenseSequenceItem[]];

type WebsterDefinition = {
	sseq: WebsterSenseSequenceItem[][];
};

type WebsterEtymologyItem = ["text", string];

export type WebsterEntry = {
	meta: WebsterMeta;
	hom?: number;
	hwi: WebsterHeadwordInfo;
	fl: FunctionalLabel;
	ins?: WebsterInflection[];
	def: WebsterDefinition[];
	et?: WebsterEtymologyItem[];
	date?: string;
	shortdef: string[];
	dxnls?: string[];
};

export type WebsterAPIResult = WebsterEntry[] | string[];
