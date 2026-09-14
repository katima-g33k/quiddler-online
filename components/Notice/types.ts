import type { PropsWithChildren } from "react";
import type { ClassNameValue } from "tailwind-merge";
import type { Brand } from "@/app/types";

type NoticeToneBrand = "NoticeTone";

const NOTICE_TONES = {
	Default: "DEFAULT",
	Error: "ERROR",
	Info: "INFO",
} as const;

export const NoticeTone = {
	Default: NOTICE_TONES.Default as Brand<
		typeof NOTICE_TONES.Default,
		NoticeToneBrand
	>,
	Error: NOTICE_TONES.Error as Brand<
		typeof NOTICE_TONES.Error,
		NoticeToneBrand
	>,
	Info: NOTICE_TONES.Info as Brand<typeof NOTICE_TONES.Info, NoticeToneBrand>,
} as const;

export type NoticeTone = (typeof NoticeTone)[keyof typeof NoticeTone];

export type NoticeProps = PropsWithChildren<{
	className?: ClassNameValue;
	tone?: NoticeTone;
}>;
