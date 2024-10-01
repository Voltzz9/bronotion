import { Button } from "@/components/ui/button";

export default function LoadingButton({pending} : {pending: boolean}) {
    return (
        <Button className="w-full" disabled={pending} type="submit" >
            {pending ? (
                <svg className="animate-spin h-5 w-5 mr-3 ..." viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A8 8 0 0112 4V0c4.418 0 8 3.582 8 8h-4a4 4 0 00-4-4V5.373z"></path>
                </svg>
            ) : (
                <span>Login</span>
            )}
        </Button>
    )
}