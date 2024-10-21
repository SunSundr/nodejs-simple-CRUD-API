type Props = { [key: string]: string | boolean };
type ParsePropsResult = [Props, string];

export function parseProps(str: string): ParsePropsResult {
  const args = str.split(' ').filter(Boolean);
  const props: Props = {};

  for (const arg of args) {
    if (!arg.startsWith('--')) {
      return [props, arg];
    }

    const [key, ...valueParts] = arg.slice(2).split('=');
    const value = valueParts.length ? valueParts.join('=') : true;

    props[key] = value;
  }

  return [props, ''];
}

export function parseArgv(): Props {
  const args = process.argv;
  let options: Props = {};
  for (let i = 2, argsLen = args.length; i < argsLen; i++) {
    options = { ...options, ...parseProps(args[i])[0] };
  }

  return options;
}
