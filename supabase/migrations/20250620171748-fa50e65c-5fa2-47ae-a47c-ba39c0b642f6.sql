
-- Create user profiles table
CREATE TABLE public.profiles (
  id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('owner', 'staff')),
  store_id uuid,
  is_active boolean NOT NULL DEFAULT true,
  avatar text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create stores table
CREATE TABLE public.stores (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL,
  owner_id uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  phone text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create customers table
CREATE TABLE public.customers (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  email text,
  address text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create inventory_items table
CREATE TABLE public.inventory_items (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores ON DELETE CASCADE,
  name text NOT NULL,
  quantity integer NOT NULL DEFAULT 0,
  reorder_level integer NOT NULL DEFAULT 10,
  price decimal(10,2) NOT NULL DEFAULT 0,
  category text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Create inventory_update_requests table
CREATE TABLE public.inventory_update_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.inventory_items ON DELETE CASCADE,
  requested_by uuid NOT NULL REFERENCES auth.users ON DELETE CASCADE,
  quantity_change integer NOT NULL,
  reason text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'denied')) DEFAULT 'pending',
  requested_at timestamp with time zone NOT NULL DEFAULT now(),
  reviewed_at timestamp with time zone,
  reviewed_by uuid REFERENCES auth.users ON DELETE SET NULL,
  PRIMARY KEY (id)
);

-- Create repairs table
CREATE TABLE public.repairs (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  store_id uuid NOT NULL REFERENCES public.stores ON DELETE CASCADE,
  customer_id uuid NOT NULL REFERENCES public.customers ON DELETE CASCADE,
  phone_model text NOT NULL,
  issue text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'in-progress', 'completed', 'delivered')) DEFAULT 'pending',
  received_date timestamp with time zone NOT NULL DEFAULT now(),
  completed_date timestamp with time zone,
  delivery_date timestamp with time zone,
  assigned_staff_id uuid REFERENCES auth.users ON DELETE SET NULL,
  bill_amount decimal(10,2) NOT NULL DEFAULT 0,
  estimated_completion timestamp with time zone,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);

-- Add foreign key constraint for store_id in profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_store_id_fkey 
FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE SET NULL;

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_update_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repairs ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Create policies for stores table
CREATE POLICY "Owners can view their stores" ON public.stores
  FOR SELECT USING (
    auth.uid() = owner_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND store_id = stores.id)
  );

CREATE POLICY "Owners can manage their stores" ON public.stores
  FOR ALL USING (auth.uid() = owner_id);

-- Create policies for customers table
CREATE POLICY "Users can view customers from their store" ON public.customers
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.stores s ON (p.store_id = s.id OR s.owner_id = p.id)
      WHERE p.id = auth.uid()
    )
  );

CREATE POLICY "Users can manage customers" ON public.customers
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.stores s ON (p.store_id = s.id OR s.owner_id = p.id)
      WHERE p.id = auth.uid()
    )
  );

-- Create policies for inventory_items table
CREATE POLICY "Users can view inventory from their store" ON public.inventory_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.stores s ON (p.store_id = s.id OR s.owner_id = p.id)
      WHERE p.id = auth.uid() AND s.id = inventory_items.store_id
    )
  );

CREATE POLICY "Owners can manage inventory" ON public.inventory_items
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.stores s 
      WHERE s.owner_id = auth.uid() AND s.id = inventory_items.store_id
    )
  );

-- Create policies for inventory_update_requests table
CREATE POLICY "Users can view update requests for their store" ON public.inventory_update_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      JOIN public.profiles p ON (p.store_id = i.store_id)
      JOIN public.stores s ON (s.id = i.store_id OR s.owner_id = p.id)
      WHERE p.id = auth.uid() AND i.id = inventory_update_requests.item_id
    )
  );

CREATE POLICY "Staff can create update requests" ON public.inventory_update_requests
  FOR INSERT WITH CHECK (auth.uid() = requested_by);

CREATE POLICY "Owners can manage update requests" ON public.inventory_update_requests
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.inventory_items i
      JOIN public.stores s ON s.id = i.store_id
      WHERE s.owner_id = auth.uid() AND i.id = inventory_update_requests.item_id
    )
  );

-- Create policies for repairs table
CREATE POLICY "Users can view repairs from their store" ON public.repairs
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.stores s ON (p.store_id = s.id OR s.owner_id = p.id)
      WHERE p.id = auth.uid() AND s.id = repairs.store_id
    )
  );

CREATE POLICY "Users can manage repairs" ON public.repairs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles p 
      JOIN public.stores s ON (p.store_id = s.id OR s.owner_id = p.id)
      WHERE p.id = auth.uid() AND s.id = repairs.store_id
    )
  );

-- Create function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    new.email,
    'staff'
  );
  RETURN new;
END;
$$;

-- Create trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
