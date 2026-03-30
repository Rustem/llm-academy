export const MODELS = [
  // Free models (tested and working on OpenRouter)
  {id:"meta-llama/llama-3.3-70b-instruct:free",name:"Llama 3.3 70B",provider:"Meta",free:true},
  {id:"meta-llama/llama-3.2-3b-instruct:free",name:"Llama 3.2 3B",provider:"Meta",free:true},
  {id:"nvidia/nemotron-3-super-120b-a12b:free",name:"Nemotron 120B",provider:"NVIDIA",free:true},
  {id:"google/gemma-3-27b-it:free",name:"Gemma 3 27B",provider:"Google",free:true},
  {id:"qwen/qwen3-coder:free",name:"Qwen3 Coder",provider:"Alibaba",free:true},
  {id:"nousresearch/hermes-3-llama-3.1-405b:free",name:"Hermes 3 405B",provider:"Nous",free:true},

  // Paid models (require funded OpenRouter account)
  {id:"anthropic/claude-sonnet-4",name:"Claude Sonnet 4",provider:"Anthropic",free:false},
  {id:"openai/gpt-4o-mini",name:"GPT-4o Mini",provider:"OpenAI",free:false},
  {id:"openai/gpt-4.1-nano",name:"GPT-4.1 Nano",provider:"OpenAI",free:false},
  {id:"google/gemini-2.5-flash",name:"Gemini 2.5 Flash",provider:"Google",free:false},
  {id:"deepseek/deepseek-chat-v3-0324",name:"DeepSeek V3",provider:"DeepSeek",free:false},
];

export const MODEL_GROUPS = [
  {label:"Free",models:MODELS.filter(m=>m.free)},
  {label:"Premium",models:MODELS.filter(m=>!m.free)},
];
