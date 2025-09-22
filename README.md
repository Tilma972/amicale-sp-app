# Amicale SP - Context pour Cursor

## Architecture actuelle
- Next.js 14 + TypeScript + Supabase
- Tailwind CSS + Shadcn/UI
- 6 modules fonctionnels développés

## Priorités refactorisation
1. Design moderne (composants existants)
2. UX mobile optimisée  
3. Cohérence visuelle globale

## Contraintes importantes
- NE PAS modifier la logique Supabase
- Garder l'accessibilité 
- Préserver les fonctionnalités offline

## Fichiers critiques à ne pas casser
- /lib/supabase.ts
- /contexts/AppContext.tsx
- Types Supabase existants