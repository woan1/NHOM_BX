from fastapi import APIRouter

router = APIRouter(prefix='/api/projects', tags=['Projects'])

@router.get('/')
def get_projects():
    return [
        {'id': 1, 'title': 'Biet thu vuon hien dai', 'location': 'Quan 2, HCM'},
        {'id': 2, 'title': 'Nha pho tan co dien', 'location': 'Binh Thanh, HCM'}
    ]

