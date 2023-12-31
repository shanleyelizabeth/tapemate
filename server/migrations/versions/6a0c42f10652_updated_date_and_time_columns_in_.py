"""Updated date and time columns in Request model

Revision ID: 6a0c42f10652
Revises: f4c391f10597
Create Date: 2023-08-17 15:07:41.467129

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '6a0c42f10652'
down_revision = 'f4c391f10597'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('_alembic_tmp_requests')
    with op.batch_alter_table('requests', schema=None) as batch_op:
        batch_op.add_column(sa.Column('date', sa.Date(), nullable=True))
        batch_op.add_column(sa.Column('start_time', sa.Time(), nullable=True))
        batch_op.add_column(sa.Column('end_time', sa.Time(), nullable=True))
        batch_op.drop_column('date_time')

    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.create_unique_constraint(batch_op.f('uq_users_username'), ['username'])

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_constraint(batch_op.f('uq_users_username'), type_='unique')

    with op.batch_alter_table('requests', schema=None) as batch_op:
        batch_op.add_column(sa.Column('date_time', sa.DATETIME(), nullable=True))
        batch_op.drop_column('end_time')
        batch_op.drop_column('start_time')
        batch_op.drop_column('date')

    op.create_table('_alembic_tmp_requests',
    sa.Column('id', sa.INTEGER(), nullable=False),
    sa.Column('actor_id', sa.INTEGER(), nullable=True),
    sa.Column('reader_id', sa.INTEGER(), nullable=True),
    sa.Column('notes', sa.VARCHAR(), nullable=True),
    sa.Column('status', sa.VARCHAR(), nullable=False),
    sa.Column('session_type', sa.VARCHAR(), nullable=False),
    sa.Column('date', sa.DATE(), nullable=False),
    sa.Column('start_time', sa.TIME(), nullable=False),
    sa.Column('end_time', sa.TIME(), nullable=False),
    sa.ForeignKeyConstraint(['actor_id'], ['users.id'], name='fk_requests_actor_id_users'),
    sa.ForeignKeyConstraint(['reader_id'], ['users.id'], name='fk_requests_reader_id_users'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###
