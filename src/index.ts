// Components are exported here as they ship. A barrel that re-exports a module which
// does not exist yet fails the typecheck, and "add the export in the same pull request
// as the component" is the rule that keeps this file honest.
export { Input, type InputProps } from './components/ui/input';
