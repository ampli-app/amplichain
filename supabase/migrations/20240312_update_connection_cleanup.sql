
-- Zaktualizuj trigger, aby usuwać zaproszenie do połączenia po usunięciu połączenia
CREATE OR REPLACE FUNCTION public.cleanup_after_connection_removal()
RETURNS TRIGGER AS $$
BEGIN
  -- Usuń powiązane zaproszenia do połączenia po usunięciu połączenia
  DELETE FROM public.connection_requests 
  WHERE (sender_id = OLD.user_id1 AND receiver_id = OLD.user_id2) 
     OR (sender_id = OLD.user_id2 AND receiver_id = OLD.user_id1);
  
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

-- Upewnij się, że trigger jest zarejestrowany
DROP TRIGGER IF EXISTS cleanup_after_connection_removal_trigger ON public.connections;
CREATE TRIGGER cleanup_after_connection_removal_trigger
AFTER DELETE ON public.connections
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_after_connection_removal();
