FROM supabase/edge-runtime:1.69.12

WORKDIR /home/deno

COPY ./supabase/functions/stranger-matchmaker  /home/deno/functions/stranger-matchmaker
