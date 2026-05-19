import { useNavigate, useSearchParams } from "react-router";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { FormInput } from "@/app/components/ui/FormInput";
import { EnhancedButton } from "@/app/components/ui/EnhancedButton";
import { auth } from "@/app/config/firebase";
import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword 
} from "firebase/auth";
import { Mail, Lock, ArrowRight, User } from "lucide-react";
import gsap from "gsap";

/* ── Form Types ── */
interface FormData {
  name?: string;
  email: string;
  password: string;
}

/* ── Auth Form Component ── */
function AuthForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSignup, setIsSignup] = useState(searchParams.get('mode') === 'signup');
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      setError(null);
      
      if (isSignup) {
        // Sign up with Firebase
        await createUserWithEmailAndPassword(auth, data.email, data.password);
      } else {
        // Sign in with Firebase
        await signInWithEmailAndPassword(auth, data.email, data.password);
      }
      
      // Don't navigate here - let AuthContext handle navigation when user state is set
      // This prevents race conditions with backend sync
    } catch (err: any) {
      console.error("Auth error:", err);
      let errorMessage = "Authentication failed. Please try again.";
      
      if (err.code === 'auth/email-already-in-use') {
        errorMessage = "Email already in use. Please sign in instead.";
      } else if (err.code === 'auth/invalid-email') {
        errorMessage = "Invalid email address.";
      } else if (err.code === 'auth/weak-password') {
        errorMessage = "Password should be at least 6 characters.";
      } else if (err.code === 'auth/user-not-found') {
        errorMessage = "No account found with this email.";
      } else if (err.code === 'auth/wrong-password') {
        errorMessage = "Incorrect password.";
      }
      
      setError(errorMessage);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setError(null);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');
      provider.setCustomParameters({
        prompt: 'select_account'
      });

      const result = await signInWithPopup(auth, provider);

      if (result.user) {
        setTimeout(() => {
          navigate('/dashboard');
        }, 500);
      }
    } catch (err: any) {
      console.error("Google sign-in error:", err);
      
      if (err.code === 'auth/popup-closed-by-user' || 
          err.code === 'auth/cancelled-popup-request') {
        return;
      }
      
      if (err.code === 'auth/popup-blocked') {
        setError("Popup was blocked. Please allow popups for this site and try again.");
        return;
      }

      if (err.code === 'auth/unauthorized-domain') {
        setError("Google sign-in not configured for this domain. Please use email/password sign up instead.");
        return;
      }
      
      setError(err.message || "Google sign-in failed. Please try again.");
    }
  };

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(formRef.current, 
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" as const }
      );
    }, formRef);
    
    return () => ctx.revert();
  }, []);

  const getFieldError = (fieldName: keyof FormData): string | undefined => {
    return errors[fieldName]?.message;
  };

  return (
    <form ref={formRef} onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {/* Global Error Alert */}
      {error && (
        <div 
          className="flex items-center gap-2 p-3 bg-error/10 border border-error/20 rounded-lg text-error text-sm"
          role="alert"
          aria-live="assertive"
        >
          <span className="flex-1">{error}</span>
        </div>
      )}

      {/* Name Field - Sign Up Only */}
      {isSignup && (
        <FormInput
          label="Name"
          type="text"
          leftIcon={<User className="w-5 h-5" />}
          error={getFieldError("name")}
          placeholder="Your name"
          {...register("name", { 
            required: isSignup ? "Name is required" : false 
          })}
        />
      )}

      {/* Email Field */}
      <FormInput
        label="Email"
        type="email"
        leftIcon={<Mail className="w-5 h-5" />}
        error={getFieldError("email")}
        helperText="We'll never share your email"
        placeholder="you@example.com"
        autoComplete="email"
        {...register("email", { 
          required: "Email is required",
          pattern: {
            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
            message: "Please enter a valid email address (e.g., user@example.com)"
          }
        })}
      />

      {/* Password Field */}
      <FormInput
        label="Password"
        type="password"
        leftIcon={<Lock className="w-5 h-5" />}
        error={getFieldError("password")}
        helperText={isSignup ? "Password must be at least 6 characters" : undefined}
        placeholder="••••••••"
        autoComplete={isSignup ? "new-password" : "current-password"}
        {...register("password", { 
          required: "Password is required",
          minLength: {
            value: 6,
            message: "Password must be at least 6 characters long"
          }
        })}
      />

      {!isSignup && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input 
              type="checkbox" 
              className="w-4 h-4 rounded border-border bg-background text-primary focus:ring-primary"
            />
            <span className="text-sm text-muted-foreground">Remember me</span>
          </label>
          <a href="#" className="text-sm text-foreground hover:text-muted-foreground transition-colors">
            Forgot password?
          </a>
        </div>
      )}

      {/* Form Section Divider */}
      <div className="form-divider" />

      {/* Submit Button with Loading State */}
      <EnhancedButton
        type="submit"
        variant="primary"
        size="lg"
        isLoading={isSubmitting}
        loadingText={isSignup ? "Creating account..." : "Signing in..."}
        className="w-full"
        rightIcon={<ArrowRight className="w-5 h-5" />}
        ripple
      >
        {isSignup ? "Sign Up" : "Sign In"}
      </EnhancedButton>

      {/* Divider with text for social login */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-elevated text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          className="border-border text-foreground hover:bg-surface"
        >
          <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled
          className="border-border text-muted-foreground cursor-not-allowed"
        >
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          GitHub
        </Button>
      </div>

      <p className="text-center text-muted-foreground">
        {isSignup ? "Already have an account? " : "Don't have an account? "}
        <button 
          type="button"
          onClick={() => {
            setIsSignup(!isSignup);
            navigate(isSignup ? '/auth' : '/auth?mode=signup');
          }}
          className="text-foreground hover:text-muted-foreground font-medium"
        >
          {isSignup ? "Sign in" : "Sign up"}
        </button>
      </p>
    </form>
  );
}

/* ── Main Auth Page ── */
export default function AuthPage() {
  const [searchParams] = useSearchParams();
  const isSignup = searchParams.get('mode') === 'signup';

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md card-hover p-8 bg-elevated animate-[fade-in-up_0.4s_ease-out_forwards]">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-primary text-primary-foreground items-center justify-center mb-4">
            <span className="font-bold text-xl">SS</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">
            {isSignup ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-muted-foreground">
            {isSignup ? "Sign up to start swapping skills" : "Sign in to continue swapping skills"}
          </p>
        </div>

        <AuthForm />
      </div>
    </div>
  );
}
