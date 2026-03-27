-- View: alumni count per company (for Mapa logo cluster)
create or replace view public.company_alumni_counts as
select
  c.id as company_id,
  c.name as company_name,
  c.logo_url,
  c.sector_id,
  s.name as sector_name,
  count(a.id)::int as alumni_count
from public.companies c
left join public.alumni a on a.company_id = c.id
left join public.sectors s on c.sector_id = s.id
where c.status = 'approved'
group by c.id, c.name, c.logo_url, c.sector_id, s.name
having count(a.id) > 0
order by count(a.id) desc;

-- View: alumni count per sector
create or replace view public.sector_alumni_counts as
select
  s.id as sector_id,
  s.name as sector_name,
  s.display_order,
  count(a.id)::int as alumni_count
from public.sectors s
join public.companies c on c.sector_id = s.id and c.status = 'approved'
join public.alumni a on a.company_id = c.id
group by s.id, s.name, s.display_order
order by count(a.id) desc;

-- View: alumni count per entry class
create or replace view public.class_alumni_counts as
select
  entry_class,
  count(*)::int as alumni_count
from public.alumni
where entry_class is not null
group by entry_class
order by entry_class;

-- View: alumni count per state (top locations)
create or replace view public.state_alumni_counts as
select
  state,
  count(*)::int as alumni_count
from public.alumni
where state is not null and state != ''
group by state
order by count(*) desc
limit 15;

-- View: overall stats
create or replace view public.mapa_stats as
select
  (select count(*)::int from public.alumni) as total_alumni,
  (select count(*)::int from public.companies where status = 'approved') as total_companies,
  (select count(*)::int from public.sectors) as total_sectors,
  (select count(distinct entry_class)::int from public.alumni where entry_class is not null) as total_classes;
