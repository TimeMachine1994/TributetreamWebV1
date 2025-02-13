import { SvelteComponentTyped } from 'svelte';

export interface CalcProps {}

export interface CalcEvents {
    calculatorComplete: CustomEvent<{ total: number }>;
}

export default class Calc extends SvelteComponentTyped<CalcProps, CalcEvents> {}
